import pandas as pd
import requests
from requests.exceptions import RequestException

# Load your original dataset
df = pd.read_csv("empowering_educ_data.csv")

# Prepare lists to store results
status_codes = []
final_urls = []
errors = []

# Loop over each link
for url in df["FINANCIAL_AID_CALC"]:
    # If URL is blank or NaN
    if pd.isna(url) or url.strip() == "":
        status_codes.append("No URL")
        final_urls.append("")
        errors.append("")
    else:
        # Ensure URL starts with http or https
        if not url.startswith(("http://", "https://")):
            test_url = "https://" + url.strip()
        else:
            test_url = url.strip()
        try:
            response = requests.get(test_url, timeout=10)
            status_codes.append(response.status_code)
            final_urls.append(response.url)
            errors.append("")
        except RequestException as e:
            status_codes.append("Error")
            final_urls.append("")
            errors.append(str(e))

# Add results back to the dataframe
df["Validated_URL"] = df["FINANCIAL_AID_CALC"].apply(
    lambda x: x if pd.isna(x) or x.startswith(("http://", "https://")) else "https://" + x.strip()
)
df["HTTP_Status"] = status_codes
df["Final_URL"] = final_urls
df["Error_Message"] = errors

# Save results
df.to_csv("validated_empowering_educ_data.csv", index=False)

print("✅ Validation complete. Results saved to validated_empowering_educ_data.csv")
