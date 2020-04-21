using System.Configuration;
using System.Data.SqlClient;
using Belgrade.SqlClient.SqlDb;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Globalization;

public static async void Run(string eventHubMessage, ILogger log)
{
    // nullable variables declaration
    string tagdata_value = "";
    string tag_name = "";
    int datetime = 0;
    DateTime timestamp = DateTime.MinValue;
    string entered_by = "KEPServerEx";
    // validates if the message sent has a body
    if(String.IsNullOrWhiteSpace(eventHubMessage))
        return;
    try{
        JObject jObject = JObject.Parse(eventHubMessage);
        if (jObject["productFilter"].ToString() == "kepserver") {
            string data = "{'data':" + jObject["data"].ToString() + "}";
            // getting all the values in the data array
            var resultObjects = AllChildren(JObject.Parse(data)).First(c => c.Type == JTokenType.Array && c.Path.Contains("data")).Children<JObject>();
            // processing all the properties in each array value and mapping those values to local variables
            foreach (JObject result in resultObjects) {
                log.LogInformation(result.ToString());
                foreach (JProperty singleProp in result.Properties())
                {
                    if (singleProp.Name == "value"){
                        tagdata_value = singleProp.Value.ToString();
                    }
                    if (singleProp.Name == "name"){
                        tag_name = singleProp.Value.ToString();
                    }
                    if (singleProp.Name == "timestamp"){
                        datetime = (int)(checked((long)singleProp.Value) / 1000);
                        DateTimeOffset dateTimeOffset = DateTimeOffset.FromUnixTimeSeconds(datetime);
                        timestamp = dateTimeOffset.UtcDateTime;
                    }
                }
            // creates the connection to the database
            var ConnString = Environment.GetEnvironmentVariable("CUSTOMCONNSTR_parkerdbconnection3"); // CUSTOMCONNSTR_parkerdbconnection for Production
            var connection = new SqlConnection(ConnString);
            // insert products and orders
            InsertTagData(connection, tag_name, tagdata_value, entered_by, timestamp);  
            } 
        }
    } catch (Exception ex) { 
        log.LogError($"There is the following exception: {ex.Message}");
    }
}
    // runs a stored procedure that udpdates or inserts data into Products table
    public static void InsertTagData (SqlConnection connection, string tag_name, string tagdata_value, string entered_by, DateTime timestamp)
    {
        var sqlCmd = new SqlCommand("spLocal_EY_DxH_Put_Production_From_IoT", connection);
        sqlCmd.CommandType = System.Data.CommandType.StoredProcedure;
        sqlCmd.SetParameters(Parameter("tag_name", tag_name), Parameter("tagdata_value", tagdata_value), Parameter("entered_by", entered_by), Parameter("entered_on", timestamp));
        connection.Open();
        sqlCmd.ExecuteNonQuery();
        connection.Close();
    }
    // set the parameters to send to the stored procedure
    public static void SetParameters(this SqlCommand command, params SqlParameter[] parameters)
    {
        command.Parameters.AddRange(parameters);
    }
    public static SqlParameter Parameter(string name, object value)
    {
        return new SqlParameter(name, value);
    }
    // recursively yield all children of json
    private static IEnumerable<JToken> AllChildren(JToken json)
    {
        foreach (var c in json.Children()) {
            yield return c;
            foreach (var cc in AllChildren(c)) {
                yield return cc;
            }
        }
    }
