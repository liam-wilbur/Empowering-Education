// This file processes the CSV data for use in our application
const collegeData = [
    {
      "UNITID": "100654",
      "OPEID": "100200",
      "OPEID6": "1002",
      "INSTNM": "Alabama A & M University",
      "CITY": "Normal",
      "STABBR": "AL",
      "ZIP": "35762",
      "ACCREDAGENCY": "Southern Association of Colleges and Schools Commission on Colleges",
      "INSTURL": "www.aamu.edu/",
      "NPCURL": "www.aamu.edu/admissions-aid/tuition-fees/net-price-calculator.html",
      "ADM_RATE": "0.684",
      "SAT_AVG": "920"
    },
    {
      "UNITID": "100663",
      "OPEID": "105200",
      "OPEID6": "1052",
      "INSTNM": "University of Alabama at Birmingham",
      "CITY": "Birmingham",
      "STABBR": "AL",
      "ZIP": "35294",
      "ACCREDAGENCY": "Southern Association of Colleges and Schools Commission on Colleges",
      "INSTURL": "www.uab.edu/",
      "NPCURL": "www.uab.edu/students/paying-for-college/net-price-calculator",
      "ADM_RATE": "0.890",
      "SAT_AVG": "1234"
    },
    {
      "UNITID": "100690",
      "OPEID": "250300",
      "OPEID6": "2503",
      "INSTNM": "Amridge University",
      "CITY": "Montgomery",
      "STABBR": "AL",
      "ZIP": "36117",
      "ACCREDAGENCY": "Southern Association of Colleges and Schools Commission on Colleges",
      "INSTURL": "www.amridgeuniversity.edu",
      "NPCURL": "www.amridgeuniversity.edu/financial-aid/net-price-calculator/",
      "ADM_RATE": "0.650",
      "SAT_AVG": "990"
    }
    // Add more entries as needed
  ];
  export type College = typeof collegeData[number];
 
  export default collegeData;
  