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
    Random random = new Random();
    string product = RandomString(10); 
    string order = RandomString(5);
    DateTime timestamp = DateTime.Now;

    try{
        // inserts products and orders
        InsertProducts(connection, product, timestamp);
        InsertOrders(connection, order, product, timestamp);
        log.LogInformation("Product inserted: " + product + "\n" + "Order inserted: " + order + "\n");
    } catch (Exception ex) {
        log.LogError($"There is the following exception: {ex.Message}");
    }
}

// runs a stored procedure that udpdates or inserts data into Products table
public static void InsertProducts (SqlConnection connection, string product, DateTime timestamp)
{
    var sqlCmd = new SqlCommand("spLocal_EY_DxH_Put_Products_From_IoT", connection);
    sqlCmd.CommandType = System.Data.CommandType.StoredProcedure;
    sqlCmd.SetParameters(Parameter("product_code", product), Parameter("product_name", product), Parameter("product_description", product), Parameter("product_family", product), Parameter("value_stream", ""), Parameter("grouping1", ""), Parameter("grouping2", ""), Parameter("grouping3", ""), Parameter("grouping4", ""), Parameter("grouping5", ""), Parameter("status", "Active"), Parameter("entered_by", "Azure Function"), Parameter("timestamp", timestamp));
    connection.Open();
    sqlCmd.ExecuteNonQuery();
    connection.Close();
}

// runs a stored procedure that inserts data into Orders table
public static void InsertOrders (SqlConnection connection, string order, string product, DateTime timestamp)
{
    var sqlCmd = new SqlCommand("spLocal_EY_DxH_Put_Orders_From_IoT", connection);
    sqlCmd.CommandType = System.Data.CommandType.StoredProcedure;
    sqlCmd.SetParameters(Parameter("order_number", order), Parameter("asset_code", "EY Machine"), Parameter("product_code", product), Parameter("order_quantity", 340), Parameter("UOM_code", "PCS_EY"), Parameter("routed_cycle_time", 60), Parameter("minutes_allowed_per_setup", 0), Parameter("ideal", 0), Parameter("target_percent_of_ideal", 0.85), Parameter("production_status", "Production"), Parameter("start_time", timestamp), Parameter("entered_by", "Azure Function"), Parameter("entered_on", timestamp));
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

// generates random string to simulate products and orders
public static string RandomString(int length)
{
    var random = new Random();
    const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return new string(Enumerable.Repeat(chars, length)
      .Select(s => s[random.Next(s.Length)]).ToArray());
}