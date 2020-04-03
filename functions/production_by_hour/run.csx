using System;
using System.Data.SqlClient;
using System.Data;
using System.Collections.Generic;

public class Order
{
    public int site_id { get; set; }
    public DateTimeOffset actual_time { get; set; }
    public DateTime actual_hour { get; set; }
    public DateTime before_hour { get; set; }
    public DateTime start_shift { get; set; }
    public int asset_id { get; set; }
    public String asset_code { get; set; }
    public int order_id { get; set; }
    public String product_code { get; set; }
    public DateTime start_time { get; set; }
    public String end_time { get; set; }
    public int productiondata_id { get; set; }
    public int dxhdata_id { get; set; }
    public Double shift_production { get; set; }
    public Boolean check_previous_rows { get; set; }
}

public static void Run(TimerInfo myTimer, ILogger log)
{
    log.LogInformation($"C# Timer trigger function executed at: {DateTime.Now}");
    //Deploy
    string ConnString = Environment.GetEnvironmentVariable("CUSTOMCONNSTR_parkerdbconnection3");
    SqlConnection connection = new SqlConnection(ConnString);
    List<Order> orders = new List<Order>();
    try
    {
        orders = getOrdersToFill(connection);
    }
    catch (Exception ex)
    {
        log.LogInformation(ex.Message);
    }
    foreach (Order order in orders)
    {
        try
        {
            fillProductionTable(order, connection, log);
        }
        catch (Exception ex)
        {
            connection.Close();
            log.LogInformation(ex.Message);
        }
    }
    log.LogInformation($"C# Timer trigger function finished successfully at: {DateTime.Now}");
}

private static List<Order> getOrdersToFill(SqlConnection connection)
{
    List<Order> results = new List<Order>();

    SqlCommand sqlCmd = new SqlCommand("spLocal_EY_DxH_Get_OrdersToCreateProduction", connection);
    sqlCmd.CommandType = System.Data.CommandType.StoredProcedure;
    connection.Open();
    SqlDataReader reader = sqlCmd.ExecuteReader();
    if (reader.HasRows)
    {
        while (reader.Read())
        {

            Order order = new Order();
            order.site_id = reader.IsDBNull(0) ? 0 : reader.GetInt32(0);
            order.actual_time = reader.GetDateTimeOffset(1);
            order.actual_hour = reader.GetDateTime(2);
            order.before_hour = reader.GetDateTime(3);
            order.start_shift = reader.GetDateTime(4);
            order.asset_id = reader.GetInt32(5);
            order.asset_code = reader.GetString(6);
            order.order_id = reader.GetInt32(7);
            order.product_code = reader.GetString(8);
            order.start_time = reader.GetDateTime(9);
            order.end_time = reader.IsDBNull(10) ? null : (reader.GetDateTime(10) + "");
            order.productiondata_id = reader.IsDBNull(11) ? 0 : reader.GetInt32(11);
            order.dxhdata_id = reader.IsDBNull(12) ? 0 : reader.GetInt32(12);
            order.shift_production = reader.IsDBNull(13) ? 0.0 : reader.GetDouble(13);
            order.check_previous_rows = reader.GetBoolean(14);
            results.Add(order);
        }
    }
    reader.Close();
    connection.Close();

    return results;
}


private static void fillProductionTable(Order order, SqlConnection connection, ILogger log)
{

    if (order.end_time != null && order.productiondata_id == 0)
    {
        log.LogInformation("Create production row for the finished order " + order.order_id.ToString() + " on " + order.before_hour + ", in the asset: " + order.asset_code + ", for product: " + order.product_code);
        createProductionRow(order, connection, log);
    }
    if (order.check_previous_rows)
    {
        DateTime start_hour_to_check = order.start_time > order.start_shift ? order.start_time : order.start_shift;
        log.LogInformation("The process needs to check the production rows from " + start_hour_to_check + " to " + order.actual_hour + ", for order " + order.order_id.ToString() + ",in the asset: " + order.asset_code + ", for the product: " + order.product_code);
        List<Order> orders = getProductionOfOrder(order, start_hour_to_check, connection);
        Boolean production_to_insert = false;
        foreach (Order order1 in orders)
        {
            if (order1.productiondata_id == 0)
            {
                log.LogInformation("Create production row for order: " + order.product_code + " from " + order1.before_hour + " to " + order1.actual_hour);
                createProductionRow(order1, connection, log);
                production_to_insert = true;
            }
        }
        if (!production_to_insert)
        {
            log.LogInformation("The order: " + order.product_code + " doesn´t have empty production rows in the current shift.");
        }
    }
}

private static List<Order> getProductionOfOrder(Order order, DateTime start_time, SqlConnection connection)
{
    List<Order> results = new List<Order>();

    SqlCommand sqlCmd = new SqlCommand("spLocal_EY_DxH_Get_ProductionData_By_Interval_And_OrderId", connection);
    sqlCmd.CommandType = System.Data.CommandType.StoredProcedure;
    sqlCmd.CommandType = System.Data.CommandType.StoredProcedure;
    sqlCmd.Parameters.Add(new SqlParameter("Order_Id", order.order_id));
    sqlCmd.Parameters.Add(new SqlParameter("start_time", start_time));
    sqlCmd.Parameters.Add(new SqlParameter("end_time", order.actual_hour));
    sqlCmd.Parameters.Add(new SqlParameter("Asset_Id", order.asset_id));
    connection.Open();
    SqlDataReader reader = sqlCmd.ExecuteReader();
    if (reader.HasRows)
    {
        while (reader.Read())
        {

            Order order1 = new Order();
            order1.order_id = order.order_id;
            order1.before_hour = reader.GetDateTime(0);
            order1.actual_hour = reader.GetDateTime(1);
            order1.productiondata_id = reader.IsDBNull(2) ? 0 : reader.GetInt32(2);
            order1.dxhdata_id = reader.IsDBNull(3) ? 0 : reader.GetInt32(3);
            order1.asset_id = order.asset_id;
            order1.site_id = order.site_id;
            results.Add(order1);
        }
    }
    reader.Close();
    connection.Close();

    return results;
}

private static void createProductionRow(Order order, SqlConnection connection, ILogger log)
{
    if (order.dxhdata_id == 0)
    {
        order.dxhdata_id = getDxHDataId(order, connection, log);
    }
    insertProductionData(order, connection, log);
}

private static int getDxHDataId(Order order, SqlConnection connection, ILogger log)
{
    int dxhDataId = 0;
    SqlCommand sqlCmd = new SqlCommand("spLocal_EY_DxH_Get_DxHDataId_new_1", connection);
    sqlCmd.CommandType = System.Data.CommandType.StoredProcedure;
    sqlCmd.Parameters.Add(new SqlParameter("Asset_Id", order.asset_id));
    sqlCmd.Parameters.Add(new SqlParameter("Timestamp", order.before_hour));
    sqlCmd.Parameters.Add(new SqlParameter("RequireOrderToCreate", false));
    connection.Open();
    SqlDataReader reader = sqlCmd.ExecuteReader();
    if (reader.HasRows)
    {
        while (reader.Read())
        {
            dxhDataId = reader.GetInt32(2);
        }
    }
    reader.Close();
    connection.Close();
    return dxhDataId;
}

private static void insertProductionData(Order order, SqlConnection connection, ILogger log)
{

    SqlCommand sqlCmd = new SqlCommand("spLocal_EY_DxH_Insert_ProductionData", connection);
    sqlCmd.CommandType = System.Data.CommandType.StoredProcedure;
    sqlCmd.Parameters.Add(new SqlParameter("DxHData_Id", order.dxhdata_id));
    sqlCmd.Parameters.Add(new SqlParameter("Order_Id", order.order_id));
    sqlCmd.Parameters.Add(new SqlParameter("Site_Id", order.site_id));
    sqlCmd.Parameters.Add(new SqlParameter("Asset_Id", order.site_id));
    sqlCmd.Parameters.Add(new SqlParameter("Timestamp_To_Create", order.before_hour));
    connection.Open();
    SqlDataReader reader = sqlCmd.ExecuteReader();
    if (reader.HasRows)
    {
        while (reader.Read())
        {
            Console.WriteLine("Status of Insert: " + reader.GetInt32(0).ToString() + ", Message: " + reader.GetString(1));
        }
    }
    reader.Close();
    connection.Close();
}