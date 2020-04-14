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
    // declaration of needed variables
    DateTime timestamp = DateTime.Now;
    string queryString = "SELECT TOP 1 tagdata_value FROM dbo.TagData ORDER BY last_modified_on DESC";
    string tagdata_value = "";
    int value = 0;

    try{
        // getting the last tag value to simulate production
        SqlCommand command = new SqlCommand(queryString, connection);
        connection.Open();
        SqlDataReader reader = command.ExecuteReader();
        if (reader.HasRows)
        {
            while (reader.Read())
            {
                tagdata_value = reader.GetString(0);
                // simulating a rollover
                if (tagdata_value == "999999"){
                    tagdata_value = "0";
                }
                // adding 1 to the tag value to simulate progression
                value = int.Parse(tagdata_value) + 1;
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
        InsertTagData(connection, tagdata_value, timestamp);  
        log.LogInformation("Tag inserted: " +tagdata_value);
    } catch (Exception ex) { 
        log.LogError($"There is the following exception: {ex.Message}");
    }
}

// runs a stored procedure that inserts within tagdata table
public static void InsertTagData (SqlConnection connection, string value, DateTime timestamp)
{
    var sqlCmd = new SqlCommand("spLocal_EY_DxH_Put_Production_From_IoT", connection);
    sqlCmd.CommandType = System.Data.CommandType.StoredProcedure;
    sqlCmd.SetParameters(Parameter("tag_name", "EY_Tag"), Parameter("tagdata_value", value), Parameter("entered_by", "Azure Function"), Parameter("entered_on", timestamp));
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

