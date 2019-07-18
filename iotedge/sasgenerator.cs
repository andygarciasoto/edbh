using System;
using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Web;

class Program
{
    static void Main(string[] args)
    {
        generateSasToken("IotHub-Dev-Environment.azure-devices.net",
                    "HbXGaDcNtLGwHELoEX0ZzwNMPvrovBeWBmh9iffw7u0=",
                    null,
                    3600);
    }

    public static string generateSasToken(string resourceUri, string key, string policyName, int expiryInSeconds = 3600)
    {
        TimeSpan fromEpochStart = DateTime.UtcNow - new DateTime(1970, 1, 1);
        string expiry = Convert.ToString((int)fromEpochStart.TotalSeconds + expiryInSeconds);

        string stringToSign = HttpUtility.UrlEncode(resourceUri) + "\n" + expiry;

        HMACSHA256 hmac = new HMACSHA256(Convert.FromBase64String(key));
        string signature = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(stringToSign)));

        string token = String.Format(CultureInfo.InvariantCulture, "SharedAccessSignature sr={0}&sig={1}&se={2}", HttpUtility.UrlEncode(resourceUri), HttpUtility.UrlEncode(signature), expiry);

        if (!String.IsNullOrEmpty(policyName))
        {
            token += "&skn=" + policyName;
        }
        return token;
    }
}
