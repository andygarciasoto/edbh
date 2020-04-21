using System;
using System.Data.SqlClient;
using System.Data;
using System.Collections.Generic;

public static void Run(TimerInfo myTimer, ILogger log)
{
    log.LogInformation($"C# Timer trigger function executed at: {DateTime.Now}");

    // creates the connection to the database
    var ConnString = Environment.GetEnvironmentVariable("CUSTOMCONNSTR_dbconnection");
    var connection = new SqlConnection(ConnString);
    // declaration of variables needed
    Random random = new Random();
    DateTime timestamp = DateTime.Now;
    string queryString = "SELECT TOP 1 TD.tagdata_value, OD.order_quantity, SUM(PD.actual) as actual FROM dbo.TagData Td INNER JOIN Tag T ON Td.tag_name = T.tag_name INNER JOIN OrderData OD ON T.asset_id = OD.asset_id INNER JOIN ProductionData PD ON OD.order_id = PD.order_id WHERE Td.tag_name = @tag_name AND OD.is_current_order = 1 GROUP BY TD.tagdata_value, OD.order_quantity, TD.last_modified_on ORDER BY TD.last_modified_on DESC";
    string tagdata_value = "";
    double order_quantity = 0;
    double actual = 0;
    int value = 0;

    try{
        // simulating production
        for (int i = 1; i < 6; i++) {
            int tag = random.Next(1, 4);
            log.LogInformation(tag.ToString());
            string tag_name = "EY_Tag" + i.ToString();

            if (tag != 2) { 
            // getting the last tag value to simulate progressive production
                SqlCommand command = new SqlCommand(queryString, connection);
                command.Parameters.AddWithValue("@tag_name", tag_name);
                connection.Open();
                SqlDataReader reader = command.ExecuteReader();
                if (reader.HasRows)
                {
                    while (reader.Read())
                    {
                        tagdata_value = reader.GetString(0);
                        order_quantity = reader.GetDouble(1);
                        actual = reader.GetDouble(2);

                        value = int.Parse(tagdata_value);
                        // simulating a rollover
                        if (value >= 999999){
                            tagdata_value = "0";
                        }
                        // adding 1 to the tag value to simulate progression
                        value = int.Parse(tagdata_value) + random.Next(1, 3);
                        tagdata_value = value.ToString();
                    }
                }
                else
                {
                    log.LogError("No rows found.");
                }
                reader.Close();
                connection.Close();
            // insert tags
                if (order_quantity > actual){
                    InsertTagData(connection, tagdata_value, timestamp, tag_name);  
                    log.LogInformation("Tag inserted for " + tag_name + " with the following value: " +tagdata_value);
                }else{
                    log.LogInformation("Tag was not inserted for " + tag_name + " due to over production");
                }
            } else {
                log.LogInformation("Tag was not inserted for " + tag_name + " due to simulated delay");
            }
        }
    } catch (Exception ex) { 
        log.LogError($"There is the following exception: {ex.Message}");
    }
}

// runs a stored procedure that inserts within tagdata table
public static void InsertTagData (SqlConnection connection, string value, DateTime timestamp, string tag_name)
{
    var sqlCmd = new SqlCommand("spLocal_EY_DxH_Put_Production_From_IoT", connection);
    sqlCmd.CommandType = System.Data.CommandType.StoredProcedure;
    sqlCmd.SetParameters(Parameter("tag_name", tag_name), Parameter("tagdata_value", value), Parameter("entered_by", "Azure Function"), Parameter("entered_on", timestamp));
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

