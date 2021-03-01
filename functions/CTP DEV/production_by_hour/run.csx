using System;
using System.Data.SqlClient;
using System.Data;
using System.Collections.Generic;

public static void Run(TimerInfo myTimer, ILogger log)
{
    log.LogInformation($"C# Timer trigger function executed at: {DateTime.Now}");
    //Deploy
    string ConnString = Environment.GetEnvironmentVariable("CUSTOMCONNSTR_parkerdbconnection");
    SqlConnection connection = new SqlConnection(ConnString);
    List<AssetInfo> sites = new List<AssetInfo>();
    try
    {
        sites = getSitesToCheck(connection);
    }
    catch (Exception ex)
    {
        if (connection != null && connection.State == ConnectionState.Open)
        {
            connection.Close();
        }
        log.LogError("Getting Sites: " + ex.Message);
    }
    foreach (AssetInfo site in sites)
    {
        log.LogInformation("Checking orders for " + site.site_name + " site.");
        try
        {
            List<AssetInfo> assets = getAssetsToCheckBySite(connection, site);
            foreach (AssetInfo asset in assets)
            {
                List<Order> orders = getShiftOrdersFromAsset(connection, asset);
                checkProduction(orders, asset, connection, log);
            }
        }
        catch (Exception ex)
        {
            if (connection != null && connection.State == ConnectionState.Open)
            {
                connection.Close();
            }
            log.LogError(ex.Message);
        }
    }
    log.LogInformation($"C# Timer trigger function finished successfully at: {DateTime.Now}");
}

private static List<AssetInfo> getSitesToCheck(SqlConnection connection)
{
    List<AssetInfo> results = new List<AssetInfo>();

    SqlCommand sqlCmd = new SqlCommand("spLocal_EY_DxH_Fill_Get_Active_Sites", connection);
    sqlCmd.CommandType = System.Data.CommandType.StoredProcedure;
    connection.Open();
    SqlDataReader reader = sqlCmd.ExecuteReader();
    if (reader.HasRows)
    {
        while (reader.Read())
        {

            AssetInfo asset = new AssetInfo();
            asset.site_id = reader.GetInt32(0);
            asset.site_name = reader.GetString(1);
            asset.current_site_time = reader.GetDateTime(2);
            asset.site_round_time = reader.GetDateTime(3);
            asset.start_shift = reader.GetDateTime(4);
            asset.end_shift = reader.GetDateTime(5);
            results.Add(asset);
        }
    }
    reader.Close();
    connection.Close();

    return results;
}

private static List<AssetInfo> getAssetsToCheckBySite(SqlConnection connection, AssetInfo site)
{
    List<AssetInfo> results = new List<AssetInfo>();

    SqlCommand sqlCmd = new SqlCommand("spLocal_EY_DxH_Fill_Row_Get_Active_Assets_By_Site", connection);
    sqlCmd.Parameters.Add(new SqlParameter("start_shift", site.start_shift));
    sqlCmd.Parameters.Add(new SqlParameter("site_round_time", site.site_round_time));
    sqlCmd.Parameters.Add(new SqlParameter("site_id", site.site_id));
    sqlCmd.CommandType = System.Data.CommandType.StoredProcedure;
    connection.Open();
    SqlDataReader reader = sqlCmd.ExecuteReader();
    if (reader.HasRows)
    {
        while (reader.Read())
        {
            AssetInfo asset = new AssetInfo();
            asset.site_id = site.site_id;
            asset.site_name = site.site_name;
            asset.current_site_time = site.current_site_time;
            asset.site_round_time = site.site_round_time;
            asset.start_shift = site.start_shift;
            asset.end_shift = site.end_shift;
            asset.asset_id = reader.GetInt32(0);
            asset.asset_code = reader.GetString(1);
            asset.asset_name = reader.GetString(2);
            results.Add(asset);
        }
    }
    reader.Close();
    connection.Close();

    return results;
}

private static List<Order> getShiftOrdersFromAsset(SqlConnection connection, AssetInfo asset)
{
    List<Order> results = new List<Order>();

    SqlCommand sqlCmd = new SqlCommand("spLocal_EY_DxH_Fill_Get_Production_By_Asset_And_Interval", connection);
    sqlCmd.Parameters.Add(new SqlParameter("Asset_Id", asset.asset_id));
    sqlCmd.Parameters.Add(new SqlParameter("start_time", asset.start_shift));
    sqlCmd.Parameters.Add(new SqlParameter("end_time", asset.site_round_time));
    sqlCmd.CommandType = System.Data.CommandType.StoredProcedure;
    connection.Open();
    SqlDataReader reader = sqlCmd.ExecuteReader();
    if (reader.HasRows)
    {
        while (reader.Read())
        {

            Order order = new Order();
            order.started_on_chunck = reader.GetDateTime(0);
            order.ended_on_chunck = reader.GetDateTime(1);
            order.order_id = reader.IsDBNull(2) ? 0 : reader.GetInt32(2);
            order.order_number = reader.IsDBNull(3) ? "" : reader.GetString(3);
            order.product_code = reader.IsDBNull(4) ? "" : reader.GetString(4);
            order.start_time = reader.IsDBNull(5) ? "" : (reader.GetDateTime(5) + "");
            order.end_time = reader.IsDBNull(6) ? "" : (reader.GetDateTime(6) + "");
            order.productiondata_id = reader.IsDBNull(7) ? 0 : reader.GetInt32(7);
            order.dxhdata_id = 0;
            order.production = reader.IsDBNull(8) ? 0.0 : reader.GetDouble(8);
            results.Add(order);
        }
    }
    reader.Close();
    connection.Close();

    return results;
}

private static void checkProduction(List<Order> orders, AssetInfo asset, SqlConnection connection, ILogger log)
{
    foreach (Order order in orders)
    {
        try
        {
            log.LogInformation("Create production row for the order " + order.order_number + " on " + order.started_on_chunck + ", in the asset: " + asset.asset_name + ", for product: " + order.product_code);
            createProductionRow(order, asset, connection, log);
        }
        catch (Exception ex)
        {
            if (connection != null && connection.State == ConnectionState.Open)
            {
                connection.Close();
            }
            log.LogError(ex.Message);
        }
    }
}

private static void createProductionRow(Order order, AssetInfo asset, SqlConnection connection, ILogger log)
{
    order.dxhdata_id = getDxHDataId(order, asset, connection);
    insertProductionData(order, asset, connection, log);
}

private static int getDxHDataId(Order order, AssetInfo asset, SqlConnection connection)
{
    int dxhDataId = 0;
    SqlCommand sqlCmd = new SqlCommand("spLocal_EY_DxH_Get_DxHDataId", connection);
    sqlCmd.CommandType = System.Data.CommandType.StoredProcedure;
    sqlCmd.Parameters.Add(new SqlParameter("Asset_Id", asset.asset_id));
    sqlCmd.Parameters.Add(new SqlParameter("Timestamp", order.started_on_chunck));
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

private static void insertProductionData(Order order, AssetInfo asset, SqlConnection connection, ILogger log)
{

    SqlCommand sqlCmd = new SqlCommand("spLocal_EY_DxH_Insert_ProductionData", connection);
    sqlCmd.CommandType = System.Data.CommandType.StoredProcedure;
    sqlCmd.Parameters.Add(new SqlParameter("DxHData_Id", order.dxhdata_id));
    sqlCmd.Parameters.Add(new SqlParameter("Order_Id", order.order_id));
    sqlCmd.Parameters.Add(new SqlParameter("Site_Id", asset.site_id));
    sqlCmd.Parameters.Add(new SqlParameter("Asset_Id", asset.asset_id));
    sqlCmd.Parameters.Add(new SqlParameter("Timestamp_To_Create", order.started_on_chunck));
    connection.Open();
    SqlDataReader reader = sqlCmd.ExecuteReader();
    if (reader.HasRows)
    {
        while (reader.Read())
        {
            log.LogInformation("Status of Insert: " + reader.GetInt32(0).ToString() + ", Message: " + reader.GetString(1));
        }
    }
    reader.Close();
    connection.Close();
}

public class AssetInfo
{
    public int site_id { get; set; }
    public String site_name { get; set; }
    public DateTime current_site_time { get; set; }
    public DateTime site_round_time { get; set; }
    public DateTime start_shift { get; set; }
    public DateTime end_shift { get; set; }
    public int asset_id { get; set; }
    public String asset_code { get; set; }
    public String asset_name { get; set; }
}

public class Order
{
    public DateTime started_on_chunck { get; set; }
    public DateTime ended_on_chunck { get; set; }
    public int order_id { get; set; }
    public String order_number { get; set; }
    public String product_code { get; set; }
    public String start_time { get; set; }
    public String end_time { get; set; }
    public int productiondata_id { get; set; }
    public int dxhdata_id { get; set; }
    public Double production { get; set; }
}