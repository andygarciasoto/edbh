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
    string product_description = "";
    string product_family = "";
    string grouping1 = "";
    string grouping2 = "";
    string grouping3 = "";
    string grouping4 = "";
    string grouping5 = "";
    string entered_by = "";
    string value_stream = "";
    float order_quantity = 0;
    string UOM_code = "";
    float routed_cycle_time = 0;
    float minutes_allowed_per_setup = 0;
    float ideal = 0;
    float target_percent_of_ideal = 0;
    DateTime valid_to = Convert.ToDateTime("1900-01-01T00:00:00");
    // validates if the message sent has a body
    if(String.IsNullOrWhiteSpace(eventHubMessage))
        return;
            
    try{
        JObject full = JObject.Parse(eventHubMessage);
        if (full["productFilter"].ToString() != "kepserver") {
        log.LogInformation(eventHubMessage);
        JObject data = (JObject)full["data"];        
    // validation of nullable values in order to send them to SQL with the message value or empty
        if (data["product_description"] != null){
            product_description = data["product_description"].ToString();
        }
        if (data["product_family"] != null){
            product_family = data["product_family"].ToString();
        }
        if (data["grouping1"] != null){
            grouping1 = data["grouping1"].ToString();
        }
        if (data["grouping2"] != null){
            grouping2 = data["grouping2"].ToString();
        }
        if (data["grouping3"] != null){
            grouping3 = data["grouping3"].ToString();
        }
        if (data["grouping4"] != null){
            grouping4 = data["grouping4"].ToString();
        }
        if (data["grouping5"] != null){
            grouping5 = data["grouping5"].ToString();
        }
        if (data["value_stream"] != null){
            value_stream = data["value_stream"].ToString();
        }
        if (data["order_quantity"] != null){
            order_quantity = float.Parse(data["order_quantity"].ToString(), CultureInfo.InvariantCulture.NumberFormat);
        }
        if (data["UOM_code"] != null){
            UOM_code = data["UOM_code"].ToString();
        }
        if (data["routed_cycle_time"] != null){
            routed_cycle_time = float.Parse(data["routed_cycle_time"].ToString(), CultureInfo.InvariantCulture.NumberFormat);
        }
        if (data["minutes_allowed_per_setup"] != null){
            minutes_allowed_per_setup = float.Parse(data["minutes_allowed_per_setup"].ToString(), CultureInfo.InvariantCulture.NumberFormat);
        }
        if (data["ideal"] != null){
            ideal = float.Parse(data["ideal"].ToString(), CultureInfo.InvariantCulture.NumberFormat);
        }
        if (data["target_percent_of_ideal"] != null){
            target_percent_of_ideal = float.Parse(data["target_percent_of_ideal"].ToString(), CultureInfo.InvariantCulture.NumberFormat);
        }
        if (data["valid_to"] != null){
            valid_to = Convert.ToDateTime(data["valid_to"].ToString());
        }
        if (data["message_source"] != null){
            entered_by = data["message_source"].ToString();
        }
        // Setting the non-nullables values based on the JSON data
        string product_code = data["product_code"].ToString();
        string product_name = data["product_name"].ToString();
        string status = data["status"].ToString();
        DateTime timestamp = Convert.ToDateTime(data["timestamp"].ToString());
        string order_number = data["order_number"].ToString();
        string asset_code = data["asset_code"].ToString();
        string production_status = data["production_status"].ToString();
        DateTime start_time = Convert.ToDateTime(data["start_time"].ToString());
        DateTime valid_from = Convert.ToDateTime(data["valid_from"].ToString());

        // creates the connection to the database
        var ConnString = Environment.GetEnvironmentVariable("CUSTOMCONNSTR_parkerdbconnection3");
        var connection = new SqlConnection(ConnString);

        // insert products and orders
        InsertProducts(connection, product_code, product_name, product_description, product_family, value_stream, grouping1, grouping2, grouping3, grouping4, grouping5, status, entered_by, timestamp);
        InsertOrders(connection, order_number, asset_code, product_code, order_quantity, UOM_code, routed_cycle_time, minutes_allowed_per_setup, ideal, target_percent_of_ideal, production_status, start_time, entered_by, timestamp);
        }
    } catch (Exception ex) {
        log.LogError($"There is the following exception: {ex.Message}");
    }
}
// runs a stored procedure that udpdates or inserts data into Products table
public static void InsertProducts (SqlConnection connection, string product_code, string product_name, string product_description, string product_family, string value_stream, string grouping1, string grouping2, string grouping3, string grouping4, string grouping5, string status, string entered_by, DateTime timestamp)
{
    var sqlCmd = new SqlCommand("spLocal_EY_DxH_Put_Products_From_IoT", connection);
    sqlCmd.CommandType = System.Data.CommandType.StoredProcedure;
    sqlCmd.SetParameters(Parameter("product_code", product_code), Parameter("product_name", product_name), Parameter("product_description", product_description), Parameter("product_family", product_family), Parameter("value_stream", value_stream), Parameter("grouping1", grouping1), Parameter("grouping2", grouping2), Parameter("grouping3", grouping3), Parameter("grouping4", grouping4), Parameter("grouping5", grouping5), Parameter("status", status), Parameter("entered_by", entered_by), Parameter("timestamp", timestamp));
    connection.Open();
    sqlCmd.ExecuteNonQuery();
    connection.Close();
}
// runs a stored procedure that inserts data into Orders table
public static void InsertOrders (SqlConnection connection, string order_number, string asset_code, string product_code, float order_quantity, string UOM_code, float routed_cycle_time, float minutes_allowed_per_setup, float ideal, float target_percent_of_ideal, string production_status, DateTime start_time, string entered_by, DateTime entered_on)
{
    var sqlCmd = new SqlCommand("spLocal_EY_DxH_Put_Orders_From_IoT", connection);
    sqlCmd.CommandType = System.Data.CommandType.StoredProcedure;
    sqlCmd.SetParameters(Parameter("order_number", order_number), Parameter("asset_code", asset_code), Parameter("product_code", product_code), Parameter("order_quantity", order_quantity), Parameter("UOM_code", UOM_code), Parameter("routed_cycle_time", routed_cycle_time), Parameter("minutes_allowed_per_setup", minutes_allowed_per_setup), Parameter("ideal", ideal), Parameter("target_percent_of_ideal", target_percent_of_ideal), Parameter("production_status", production_status), Parameter("start_time", start_time), Parameter("entered_by", entered_by), Parameter("entered_on", entered_on));
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