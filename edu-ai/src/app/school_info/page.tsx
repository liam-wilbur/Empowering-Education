"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
/*import collegeData, { College } from './collegeData';*/
import "./styles.css";
import Papa from "papaparse";
import { Outfit } from "next/font/google";

const outfit = Outfit({ subsets: ["latin"] });

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

import { Bar } from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  ChartOptions,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);
ChartJS.register(BarElement, CategoryScale, LinearScale, Title);

type SchoolData = {
  NAME: string;
  WEBSITE_LINK: string;
  AVG_DEBT: string;
  AVG_MONTHLY_REPAY: string;
  FINANCIAL_AID_CALC: string;
  SCHOOL_MEDIAN_EARNINGS: string;
  NATIONAL_4_YEAR_MEDIAN: string;
  EARNINGS_VS_HS_GRAD: number;
  WHITE_POP: number;
  BLACK_POP: number;
  HISPANIC_POP: number;
  ASIAN_POP: number;
  HAWAIIAN_PACIFIC_ISLANDER_POP: number;
  MULTIRACIAL_POP: number;
  UNKNOWN_RACE_POP: number;
  INTERNATIONAL_POP: number;
  COST_AFTER_AID_0_30: string;
  COST_AFTER_AID_30_48: string;
  COST_AFTER_AID_48_75: string;
  COST_AFTER_AID_75_110: string;
  COST_AFTER_AID_110: string;
  MONTHLY_REPAY_PERCENTAGE: number;
};

// Custom debounce hook when searching to prevent lag when spamming letters
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

function normalizeLink(raw: string): string {
  console.log("Normalizing link:", raw);
  if (!raw) return '#';

  const url = raw.trim();

  // If it already contains ://, assume it’s fine
  if (url.includes('://')) {
    return url;
  }

  // Otherwise, prepend https://
  return `https://${url}`;
}






export default function CollegeInfoApp() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedSchool, setSelectedSchool] = useState<SchoolData | null>(null);
  const [comparisonSchool, setComparisonSchool] = useState<SchoolData | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("COST OF ENROLLMENT");
  // const [filteredColleges, setFilteredColleges] = useState<SchoolData[]>([]);
  const [headerSearch, setHeaderSearch] = useState("");
  const [compareMode, setCompareMode] = useState(false);
  const [compareSearchQuery, setCompareSearchQuery] = useState("");
  // const [compareFilteredColleges, setCompareFilteredColleges] = useState<SchoolData[]>([]);
  const [showCompareSearch, setShowCompareSearch] = useState(false);
  const [csvData, setCsvData] = useState<SchoolData[]>([]); // Moved here from SchoolDataViewer
  const [isLoading, setIsLoading] = useState(true);
  // Add debounced search queries (adjust delay as needed - 300ms is good balance)
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedCompareSearchQuery = useDebounce(compareSearchQuery, 300);
  // Add loading state to prevent search while CSV is loading
  const isSearchReady = !isLoading && csvData.length > 0;

  // Memoize the search function to prevent unnecessary re-renders
  const searchColleges = useCallback(
    (query: string, excludeSchool?: string) => {
      if (query.length < 2) return [];

      const lowerQuery = query.toLowerCase();
      return csvData
        .filter((college) => {
          const matchesQuery = college.NAME.toLowerCase().includes(lowerQuery);
          const notExcluded = !excludeSchool || college.NAME !== excludeSchool;
          return matchesQuery && notExcluded;
        })
        .slice(0, 5);
    },
    [csvData]
  );

  // Use useMemo to optimize filtering
  const filteredColleges = useMemo(() => {
    if (!isSearchReady) return [];
    return searchColleges(debouncedSearchQuery);
  }, [debouncedSearchQuery, searchColleges, isSearchReady]);

  const compareFilteredColleges = useMemo(() => {
    if (!isSearchReady) return [];
    return searchColleges(debouncedCompareSearchQuery, selectedSchool?.NAME);
  }, [
    debouncedCompareSearchQuery,
    selectedSchool?.NAME,
    searchColleges,
    isSearchReady,
  ]);

  // Load CSV data on component mount
  useEffect(() => {
    const loadCsvData = async () => {
      try {
        const response = await fetch("/empowering_educ_data.csv");
        const text = await response.text();
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            setCsvData(result.data as SchoolData[]);
            setIsLoading(false);
          },
          error: (err: any) => {
            console.error("CSV parsing error:", err);
            setIsLoading(false);
          },
        });
      } catch (err) {
        console.error("Failed to load CSV:", err);
        setIsLoading(false);
      }
    };

    loadCsvData();
  }, []);

  /*
  // Update filtered colleges when search query changes
  useEffect(() => {
    if (searchQuery.length > 2 && csvData.length > 0) {
      const filtered = csvData.filter(college => 
        college.NAME.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);
      setFilteredColleges(filtered);
    } else {
      setFilteredColleges([]);
    }
  }, [searchQuery, csvData]);
  */

  /*
  useEffect(() => {
    if (searchQuery.length > 2) {
      const filtered = collegeData.filter(college => 
        college.INSTNM.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);
      setFilteredColleges(filtered);
    } else {
      setFilteredColleges([]);
    }
  }, [searchQuery]);

  const loadCsvData = (): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      fetch('public/empowering_educ_data.csv')
        .then((res) => res.text())
        .then((text) => {
          Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => resolve(result.data),
            error: (err: Error) => reject(err),
          });
        });
    });
  };*/
  /*
  useEffect(() => {
    if (compareSearchQuery.length > 2) {
      const filtered = csvData.filter(college => 
        college.NAME.toLowerCase().includes(compareSearchQuery.toLowerCase()) &&
        csvData.filter(college => 
          college.NAME.toLowerCase().includes(compareSearchQuery.toLowerCase()) &&
          college.NAME !== selectedSchool?.NAME // Avoid selecting the same school
        )
      ).slice(0, 5);
      setCompareFilteredColleges(filtered);
    } else {
      setCompareFilteredColleges([]);
    }
  }, [compareSearchQuery, selectedSchool]);

  */

  const handleCollegeSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim() && filteredColleges.length > 0) {
      setSelectedSchool(filteredColleges[0]);
      setCurrentPage("school");
      setActiveTab("COST OF ENROLLMENT");
    }
  };

  const handleHeaderSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Header search:", headerSearch);
    setHeaderSearch("");
  };

  const selectCollege = (college: SchoolData) => {
    setSelectedSchool(college);
    setCurrentPage("school");
    setActiveTab("COST OF ENROLLMENT");
    setSearchQuery("");
    // setFilteredColleges([]);
  };

  const selectComparisonCollege = (college: SchoolData) => {
    setComparisonSchool(college);
    setCompareSearchQuery("");
    // setCompareFilteredColleges([]);
    setShowCompareSearch(false);
    setCompareMode(true);
  };

  // Also optimize the search results rendering
  const renderSearchResults = useMemo(() => {
    if (filteredColleges.length === 0) return null;

    return (
      <div className="main-search-results">
        {filteredColleges.map((college) => (
          <div
            key={college.NAME}
            className="main-search-result-item"
            onClick={() => selectCollege(college)}
          >
            {college.NAME}
          </div>
        ))}
      </div>
    );
  }, [filteredColleges, selectCollege]);

  const renderCompareSearchResults = useMemo(() => {
    if (compareFilteredColleges.length === 0) return null;

    return (
      <div className="compare-search-results">
        {compareFilteredColleges.map((college) => (
          <div
            key={college.NAME}
            className="compare-search-result-item"
            onClick={() => selectComparisonCollege(college)}
          >
            {college.NAME}
          </div>
        ))}
      </div>
    );
  }, [compareFilteredColleges, selectComparisonCollege]);

  const resetComparison = () => {
    setComparisonSchool(null);
    setCompareMode(false);
    setShowCompareSearch(false);
  };

  const returnToHome = () => {
    setCurrentPage("home");
    setSearchQuery("");
    setSelectedSchool(null);
    setComparisonSchool(null);
    setCompareMode(false);
    // setFilteredColleges([]);
  };

  const returnToMainPage = () => {
    setSearchQuery("");
    setSelectedSchool(null);
    setComparisonSchool(null);
    setCompareMode(false);
    window.location.href = "/";
  };

  const toggleCompareSearch = () => {
    setShowCompareSearch(!showCompareSearch);
    if (!showCompareSearch) {
      setCompareSearchQuery("");
    }
  };

  const getMockData = (schoolName: string) => {
    if (!csvData || csvData.length === 0) {
      console.warn("CSV data not loaded yet.");
      return null;
    }

    const row = csvData.find(
      (college) =>
        college.NAME?.toLowerCase().trim() === schoolName.toLowerCase().trim()
    );

    if (!row) {
      console.warn(`No data found for school: ${schoolName}`);
      return null;
    }

    return {
      NAME: schoolName,
      WEBSITE_LINK: row.WEBSITE_LINK,
      AVG_DEBT: (Math.round(Number(row.AVG_DEBT) * 100) / 100).toLocaleString(
        "en-US"
      ),
      AVG_MONTHLY_REPAY: (
        Math.round(Number(row.AVG_MONTHLY_REPAY) * 100) / 100
      ).toLocaleString("en-US"),
      FINANCIAL_AID_CALC:
        Math.round(Number(row.FINANCIAL_AID_CALC) * 100) / 100,
      SCHOOL_MEDIAN_EARNINGS: (
        Math.round(Number(row.SCHOOL_MEDIAN_EARNINGS) * 100) / 100
      ).toLocaleString("en-US"),
      NATIONAL_4_YEAR_MEDIAN: (
        Math.round(Number(row.NATIONAL_4_YEAR_MEDIAN) * 100) / 100
      ).toLocaleString("en-US"),
      EARNINGS_VS_HS_GRAD:
        Math.round(Number(row.EARNINGS_VS_HS_GRAD) * 100 * 100) / 100,
      WHITE_POP: Math.round(Number(row.WHITE_POP) * 100 * 100) / 100,
      BLACK_POP: Math.round(Number(row.BLACK_POP) * 100 * 100) / 100,
      HISPANIC_POP: Math.round(Number(row.HISPANIC_POP) * 100 * 100) / 100,
      ASIAN_POP: Math.round(Number(row.ASIAN_POP) * 100 * 100) / 100,
      HAWAIIAN_PACIFIC_ISLANDER_POP:
        Math.round(Number(row.HAWAIIAN_PACIFIC_ISLANDER_POP) * 100 * 100) / 100,
      MULTIRACIAL_POP:
        Math.round(Number(row.MULTIRACIAL_POP) * 100 * 100) / 100,
      UNKNOWN_RACE_POP:
        Math.round(Number(row.UNKNOWN_RACE_POP) * 100 * 100) / 100,
      INTERNATIONAL_POP:
        Math.round(Number(row.INTERNATIONAL_POP) * 100 * 100) / 100,
      COST_AFTER_AID_0_30: Number(row.COST_AFTER_AID_0_30).toLocaleString(
        "en-US"
      ),
      COST_AFTER_AID_30_48: Number(row.COST_AFTER_AID_30_48).toLocaleString(
        "en-US"
      ),
      COST_AFTER_AID_48_75: Number(row.COST_AFTER_AID_48_75).toLocaleString(
        "en-US"
      ),
      COST_AFTER_AID_75_110: Number(row.COST_AFTER_AID_75_110).toLocaleString(
        "en-US"
      ),
      COST_AFTER_AID_110: Number(row.COST_AFTER_AID_110).toLocaleString(
        "en-US"
      ),
      MONTHLY_REPAY_PERCENTAGE:
        Math.round(Number(row.MONTHLY_REPAY_PERCENTAGE) * 100 * 100) / 100,
    };
  };

  const getDemographicPieDataChartJS = (school: SchoolData | null) => {
    if (!school) return null;

    return {
      labels: [
        "White",
        "Black",
        "Hispanic",
        "Asian",
        "Hawaiian/Pacific Islander",
        "Multiracial",
        "Unknown Race",
        "International",
      ],
      datasets: [
        {
          label: "Population %",
          data: [
            school.WHITE_POP * 100,
            school.BLACK_POP * 100,
            school.HISPANIC_POP * 100,
            school.ASIAN_POP * 100,
            school.HAWAIIAN_PACIFIC_ISLANDER_POP * 100,
            school.MULTIRACIAL_POP * 100,
            school.UNKNOWN_RACE_POP * 100,
            school.INTERNATIONAL_POP * 100,
          ],
          backgroundColor: [
            "#8884d8",
            "#82ca9d",
            "#ffc658",
            "#ff8042",
            "#8dd1e1",
            "#a4de6c",
            "#d0ed57",
            "#ffbb28",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const ExpectedAidChart = ({ school }: { school: SchoolData | null }) => {
    if (!school) return null;
    const data = {
      labels: ["0 - 30K", "30K - 48K", "48K - 75K", "75K - 110K", "110K+"],
      datasets: [
        {
          label: "AVG. COST AFTER AID",
          data: [
            school.COST_AFTER_AID_0_30,
            school.COST_AFTER_AID_30_48,
            school.COST_AFTER_AID_48_75,
            school.COST_AFTER_AID_75_110,
            school.COST_AFTER_AID_110,
          ],
          backgroundColor: "#DCCFE5", // light purple
          borderWidth: 0,
        },
      ],
    };

    const options: ChartOptions<"bar"> = {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: `Expected Cost After Aid from ${school.NAME}`.toUpperCase(),
          color: "#000",
          font: {
            size: 18,
            weight: "bold" as const,
            family: "Outfit, sans-serif",
          },
          align: "end", // moves title aligned left inside the chart area
        },
        tooltip: {
          callbacks: {
            label: (context: any) => `$${context.parsed.y.toLocaleString()}`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: (value: string | number) => {
              // Convert value to number if it's string
              const num = typeof value === "string" ? parseFloat(value) : value;

              if (num >= 1_000_000 || num <= -1_000_000) {
                return `$${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
              }
              if (num >= 1_000 || num <= -1_000) {
                return `$${(num / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
              }
              return `$${num}`;
            },
            color: "#000",
            font: {
              size: 14,
              weight: "bold" as const,
              family: "Outfit, sans-serif",
            },
          },
          grid: {
            display: true,
            color: (context) => {
              if (context.tick.value === 0) {
                return "#EEA719"; // highlight zero line differently
              }
              return "#ccc"; // default grid line color
            },
            lineWidth: (context) => {
              return context.tick.value === 0 ? 3 : 1; // thicker zero line
            },
          },
          border: {
            display: true, // Show the axis line
            color: "#EEA719", // Color of the axis line
            width: 3, // Thickness of the axis line in pixels
          },
          title: {
            display: true,
            text: "AVG. COST AFTER AID",
            color: "#8269AA",
            font: {
              size: 18,
              weight: "bold" as const,
              family: "Outfit, sans-serif",
            },
          },
        },
        x: {
          ticks: {
            color: "#000",
            font: {
              size: 14,
              weight: "bold" as const,
              family: "Outfit, sans-serif",
            },
          },
          grid: {
            display: false, // 🔥 Hide horizontal grid lines
          },

          title: {
            display: true,
            text: "ANNUAL FAMILY INCOME ($)",
            color: "#8269AA",
            font: {
              size: 18,
              weight: "bold" as const,
              family: "Outfit, sans-serif",
            },
          },
        },
      },
    };

    return <Bar data={data} options={options} />;
  };

  interface ComparisonExpectedAidChartProps {
    selectedSchool: SchoolData | null;
    comparisonSchool: SchoolData | null;
  }

  const ComparisonExpectedAidChart = ({
    selectedSchool,
    comparisonSchool,
  }: ComparisonExpectedAidChartProps) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<ChartJS<"bar"> | null>(null);

    useEffect(() => {
      if (!selectedSchool || !comparisonSchool || !chartRef.current) return;

      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext("2d");
      if (!ctx) return;

      // Prepare data - convert strings to numbers
      const labels = [
        "0 - 30K",
        "30K - 48K",
        "48K - 75K",
        "75K - 110K",
        "110K+",
      ];
      const selectedSchoolData = [
        Math.max(0, Number(selectedSchool.COST_AFTER_AID_0_30) || 0),
        Math.max(0, Number(selectedSchool.COST_AFTER_AID_30_48) || 0),
        Math.max(0, Number(selectedSchool.COST_AFTER_AID_48_75) || 0),
        Math.max(0, Number(selectedSchool.COST_AFTER_AID_75_110) || 0),
        Math.max(0, Number(selectedSchool.COST_AFTER_AID_110) || 0),
      ];
      const comparisonSchoolData = [
        Math.max(0, Number(comparisonSchool.COST_AFTER_AID_0_30) || 0),
        Math.max(0, Number(comparisonSchool.COST_AFTER_AID_30_48) || 0),
        Math.max(0, Number(comparisonSchool.COST_AFTER_AID_48_75) || 0),
        Math.max(0, Number(comparisonSchool.COST_AFTER_AID_75_110) || 0),
        Math.max(0, Number(comparisonSchool.COST_AFTER_AID_110) || 0),
      ];

      chartInstance.current = new ChartJS(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: selectedSchool.NAME,
              data: selectedSchoolData,
              backgroundColor: "#DCCFE5",
              borderColor: "#DCCFE5",
              borderWidth: 0,
              borderRadius: 2,
            },
            {
              label: comparisonSchool.NAME,
              data: comparisonSchoolData,
              backgroundColor: "#8B7AA8",
              borderColor: "#8B7AA8",
              borderWidth: 0,
              borderRadius: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: "EXPECTED COST AFTER AID COMPARISON",
              font: {
                size: 14,
                weight: "bold",
                family: "Outfit, sans-serif",
              },
              color: "#000",
              padding: {
                bottom: 20,
              },
            },
            legend: {
              display: true,
              position: "top",
              labels: {
                font: {
                  size: 12,
                  weight: "bold",
                },
                color: "#333",
                padding: 5,
                usePointStyle: true,
                pointStyle: "rect",
              },
            },
            tooltip: {
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              titleColor: "#333",
              bodyColor: "#333",
              borderColor: "#ddd",
              borderWidth: 1,
              cornerRadius: 6,
              displayColors: true,
              callbacks: {
                label: function (context: any) {
                  const value = context.parsed.y;
                  return `${context.dataset.label}: $${value.toLocaleString()}`;
                },
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "ANNUAL FAMILY INCOME ($)",
                font: {
                  size: 15,
                  weight: "bold",
                  family: "Outfit, sans-serif",
                },
                color: "#8269AA",
                padding: {
                  top: 10,
                },
              },
              ticks: {
                font: {
                  size: 11,
                  weight: "bold",
                  family: "Outfit, sans-serif",
                },
                color: "#000000",
                maxRotation: 15,
              },
              grid: {
                display: false,
              },
            },
            y: {
              title: {
                display: true,
                text: "AVG. COST AFTER AID",
                font: {
                  size: 15,
                  weight: "bold",
                  family: "Outfit, sans-serif",
                },
                color: "#8269AA",
              },
              ticks: {
                font: {
                  size: 11,
                  weight: "bold",
                  family: "Outfit, sans-serif",
                },
                color: "#000000",
                callback: function (value: any) {
                  const numValue = Number(value);
                  if (numValue >= 1000) {
                    return `${numValue / 1000}K`;
                  }
                  return numValue.toString();
                },
              },
              grid: {
                display: true,
                color: (context) => {
                  if (context.tick.value === 0) {
                    return "#EEA719"; // highlight zero line differently
                  }
                  return "#ccc"; // default grid line color
                },
                lineWidth: (context) => {
                  return context.tick.value === 0 ? 3 : 1; // thicker zero line
                },
              },
              beginAtZero: true,
            },
          },
          layout: {
            padding: {
              top: 10,
              bottom: 10,
              left: 10,
              right: 10,
            },
          },
        },
      });

      // Cleanup function
      return () => {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
      };
    }, [selectedSchool, comparisonSchool]);

    if (!selectedSchool || !comparisonSchool) return null;

    return (
      <div
        style={{
          width: "100%",
          height: "400px",
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          position: "relative",
        }}
      >
        <canvas
          ref={chartRef}
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </div>
    );
  };

  interface ComparisonMedianEarningsChartProps {
    selectedSchool: SchoolData | null;
    comparisonSchool: SchoolData | null;
  }

  const ComparisonMedianEarningsChart = ({
    selectedSchool,
    comparisonSchool,
  }: ComparisonMedianEarningsChartProps) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<ChartJS<"bar"> | null>(null);

    useEffect(() => {
      if (!selectedSchool || !comparisonSchool || !chartRef.current) return;

      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext("2d");
      if (!ctx) return;

      // Get the data - ensure we're working with numbers
      const selectedEarnings = Number(
        selectedSchool.SCHOOL_MEDIAN_EARNINGS.replace(/,/g, "")
      );
      const comparisonEarnings = Number(
        comparisonSchool.SCHOOL_MEDIAN_EARNINGS.replace(/,/g, "")
      );
      const nationalAverage = 50000; // Fixed national average as mentioned

      chartInstance.current = new ChartJS(ctx, {
        type: "bar",
        data: {
          labels: [
            selectedSchool.NAME,
            comparisonSchool.NAME,
            "National Average",
          ],
          datasets: [
            {
              label: "Median Earnings After 10 Years",
              data: [selectedEarnings, comparisonEarnings, nationalAverage],
              backgroundColor: ["#DCCFE5", "#8B7AA8", "#F59E0B"],
              borderColor: ["#DCCFE5", "#8B7AA8", "#F59E0B"],
              borderWidth: 0,
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: "MEDIAN EARNINGS AFTER 10 YEARS",
              font: {
                size: 16,
                weight: "bold",
                family: "Outfit, sans-serif",
              },
              color: "#333",
              padding: {
                bottom: 20,
              },
            },
            legend: {
              display: false,
            },
            tooltip: {
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              titleColor: "#333",
              bodyColor: "#333",
              borderColor: "#ddd",
              borderWidth: 1,
              cornerRadius: 6,
              callbacks: {
                label: function (context) {
                  return `$${context.parsed.y.toLocaleString()}`;
                },
              },
            },
          },
          scales: {
            x: {
              ticks: {
                font: {
                  size: 12,
                  weight: "bold",
                  family: "Outfit, sans-serif",
                },
                color: "#333",
                maxRotation: 20,
                minRotation: 20,
              },
              grid: {
                display: false,
              },
            },
            y: {
              beginAtZero: true,
              ticks: {
                font: {
                  size: 12,
                  weight: "bold",
                  family: "Outfit, sans-serif",
                },
                color: "#333",
                callback: function (value) {
                  const numValue = Number(value);
                  if (numValue >= 1000) {
                    return `$${(numValue / 1000).toFixed(0)}K`;
                  }
                  return `$${numValue}`;
                },
              },
              grid: {
                color: "#f0f0f0",
                lineWidth: 1,
              },
              title: {
                display: true,
                text: "MEDIAN EARNINGS ($)",
                font: {
                  size: 16,
                  weight: "bold",
                  family: "Outfit, sans-serif",
                },
                color: "#8269AA",
              },
            },
          },
          layout: {
            padding: {
              top: 10,
              bottom: 10,
              left: 10,
              right: 10,
            },
          },
        },
      });

      return () => {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
      };
    }, [selectedSchool, comparisonSchool]);

    if (!selectedSchool || !comparisonSchool) return null;

    return (
      <div
        style={{
          width: "100%",
          height: "400px",
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <canvas
          ref={chartRef}
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </div>
    );
  };

  const schoolTabs = [
    "COST OF ENROLLMENT",
    "EXPECTED AID",
    "WHAT'S THE VALUE OF GOING",
    "DEMOGRAPHICS",
    "SCHOLARSHIPS",
    "STEPS TO APPLY",
  ];

  const [stepsData, setStepsData] = useState<any[]>([]);

  // Load steps_to_apply.csv on mount
  useEffect(() => {
    const loadStepsData = async () => {
      try {
        const response = await fetch("/steps_to_apply.csv");
        const text = await response.text();
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            setStepsData(result.data);
          },
          error: (err: any) => {
            console.error("Steps CSV parsing error:", err);
          },
        });
      } catch (err) {
        console.error("Failed to load steps CSV:", err);
      }
    };
    loadStepsData();
  }, []);

  // Helper to normalize school names for matching
  const normalizeName = (name: string) =>
    name
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .trim();

  // Helper to get steps for selected school
  const getStepsForSchool = (schoolName: string | undefined | null) => {
    if (!schoolName) return null;
    const normSchool = normalizeName(schoolName);
    // Debug: log all names being compared
    if (stepsData.length > 0) {
      console.log(
        "Looking for:",
        normSchool,
        "in",
        stepsData.map((r) => normalizeName(r.NAME))
      );
    }
    const row = stepsData.find((row) => normalizeName(row.NAME) === normSchool);
    return row || null;
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-container">
          <div className="logo-container">
            <div className="edu-logo" onClick={returnToMainPage}>
              <span>
                <img
                  src="/images/Graduation_Cap.png"
                  alt="Graduation-Cap"
                  className="icon-logo"
                  onClick={returnToHome}
                />
              </span>
            </div>
          </div>

          <div className="header-actions">
            {/* <div className="search-container">
              <form onSubmit={handleHeaderSearch}>
                <input
                  type="text"
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  className="search-input"
                  placeholder="Search..."
                />
                <button type="submit" className="search-button">→</button>
              </form>
            </div> */}
            <button className="header-button">ESSAY FAQ</button>
            <a
              href="/financial_aid_guide.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="header-button"
            >
              FINANCIAL AID GUIDE
            </a>
          </div>
        </div>
      </header>

      {currentPage === "home" ? (
        <div className="home-content">
          <div className="banner">
            <div className="banner-container">
              <h1 className="banner-title">FIND COLLEGE INFO</h1>
            </div>
          </div>

          <div className="main-container">
            <div className="search-intro">
              <div className="telescope-icon">
                <span>
                  <img
                    src="/images/Telescope.png"
                    alt="Telescope"
                    className="telescope-logo"
                  />
                </span>
              </div>
              <h2 className="search-prompt">
                Type in a school's name to find information about...
              </h2>

              <div className="info-categories">
                <div className="info-category">
                  <div className="category-icon green">
                    <span>
                      <img
                        src="/images/Scholarships.png"
                        alt="Scholarships"
                        className="category-logo"
                      />
                    </span>
                  </div>
                  <div className="category-text">
                    <div className="category-title">Debt, Aid,</div>
                    <div className="category-subtitle green">Scholarships</div>
                  </div>
                </div>

                <div className="info-category">
                  <div className="category-icon blue">
                    <span>
                      <img
                        src="/images/Demographics.png"
                        alt="Demographics"
                        className="category-logo"
                      />
                    </span>
                  </div>
                  <div className="category-text">
                    <div className="category-title">College</div>
                    <div className="category-subtitle blue">Demographics</div>
                  </div>
                </div>

                <div className="info-category">
                  <div className="category-icon yellow">
                    <span>
                      <img
                        src="/images/Admission.png"
                        alt="Admission"
                        className="category-logo"
                      />
                    </span>
                  </div>
                  <div className="category-text">
                    <div className="category-title">Chances of</div>
                    <div className="category-subtitle yellow">Admission</div>
                  </div>
                </div>

                <div className="info-category">
                  <div className="category-icon purple">
                    <span>
                      <img
                        src="/images/Steps.png"
                        alt="Steps"
                        className="category-logo"
                      />
                    </span>
                  </div>
                  <div className="category-text">
                    <div className="category-title">Steps to</div>
                    <div className="category-subtitle purple">Apply</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="main-search">
              <form onSubmit={handleCollegeSearch} className="main-search-form">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="main-search-input"
                  placeholder="Search School..."
                />
                <button type="submit" className="main-search-button">
                  <img
                    src="/images/Search.png"
                    alt="Info icon"
                    width="20"
                    height="20"
                  />
                </button>
              </form>

              {
                /* {filteredColleges.length > 0 && (
                <div className="main-search-results">
                  {filteredColleges.map((college) => (
                    <div 
                      key={college.NAME} 
                      className="main-search-result-item"
                      onClick={() => selectCollege(college)}
                    >
                      {college.NAME}
                    </div>
                  ))}
                </div>
              )} */ renderSearchResults
              }
            </div>
          </div>
        </div>
      ) : (
        <div className="school-content">
          <div className="banner">
            <div className="banner-container">
              <div className="banner-back-arrow" onClick={returnToHome}>
                ←
              </div>
              <h1 className="banner-title">FIND COLLEGE INFO</h1>
              {!compareMode && <div className="banner-icon"></div>}
            </div>
          </div>

          <div className="main-container">
            <p className="info-link">
              Click to explore more tuition, financial aid, & demographic info
              about any college:{" "}
              <a href="https://collegescorecard.ed.gov/" className="link">
                https://collegescorecard.ed.gov/
              </a>
            </p>

            {showCompareSearch ? (
              <div className="compare-search-box compare-box">
                <input
                  type="text"
                  value={compareSearchQuery}
                  onChange={(e) => setCompareSearchQuery(e.target.value)}
                  className="compare-search-input"
                  placeholder="Add a school to compare..."
                  autoFocus
                />
                <button
                  className="compare-cancel-button"
                  onClick={() => {
                    setShowCompareSearch(false);
                    resetComparison();
                  }}
                >
                  ×
                </button>

                {
                  /* {compareFilteredColleges.length > 0 && (
                  <div className="compare-search-results">
                    {compareFilteredColleges.map((college) => (
                      <div 
                        key={college.NAME} 
                        className="compare-search-result-item"
                        onClick={() => selectComparisonCollege(college)}
                      >
                        {college.NAME}
                      </div>
                    ))}
                  </div>
                )} */ renderCompareSearchResults
                }
              </div>
            ) : (
              <div
                className="compare-box"
                onClick={!comparisonSchool ? toggleCompareSearch : undefined}
              >
                <div className="compare-text">
                  {comparisonSchool
                    ? `COMPARING WITH: ${comparisonSchool.NAME}`
                    : "Add a school to compare..."}
                </div>
                <button
                  className="compare-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    comparisonSchool
                      ? resetComparison()
                      : toggleCompareSearch();
                  }}
                >
                  {comparisonSchool ? "×" : "+"}
                </button>
              </div>
            )}

            {compareMode && comparisonSchool ? (
              <div className="comparison-view">
                <div className="schools-header">
                  <div className="school-header-item">
                    <div className="school-icon">
                      {" "}
                      <img
                        src="/images/Cap.png"
                        alt="Info icon"
                        width="30"
                        height="30"
                      />{" "}
                    </div>
                    <h2 className="school-name">{selectedSchool?.NAME}</h2>
                  </div>
                  <div className="vs-indicator">VS.</div>
                  <div className="school-header-item">
                    <div className="school-icon">
                      {" "}
                      <img
                        src="/images/Cap.png"
                        alt="Info icon"
                        width="30"
                        height="30"
                      />{" "}
                    </div>
                    <h2 className="school-name">{comparisonSchool.NAME}</h2>
                  </div>
                </div>

                <div className="school-tabs">
                  <div className="tabs-container">
                    {schoolTabs.map((tab) => {
                      const isDisabled =
                        comparisonSchool &&
                        (tab === "SCHOLARSHIPS" || tab === "STEPS TO APPLY");
                      return (
                        <button
                          key={tab}
                          onClick={() => !isDisabled && setActiveTab(tab)}
                          className={`tab ${
                            activeTab === tab ? "active-tab" : ""
                          } ${isDisabled ? "disabled-tab" : ""}`}
                          style={{
                            opacity: isDisabled ? 0.5 : 1,
                            cursor: isDisabled ? "not-allowed" : "pointer",
                            color: isDisabled ? "#999" : undefined,
                            backgroundColor: isDisabled ? "#f5f5f5" : undefined,
                          }}
                          disabled={!!isDisabled}
                        >
                          {tab}
                        </button>
                      );
                    })}
                  </div>

                  <div className="tab-content">
                    {activeTab === "COST OF ENROLLMENT" && (
                      <div className="financial-info">
                        {selectedSchool && comparisonSchool && (
                          <>
                            <div className="stat-cards-enrollment">
                              <div className="stat-card">
                                <div className="stat-value">
                                  $
                                  {Math.abs(
                                    Number(
                                      selectedSchool.AVG_DEBT.replace(/,/g, "")
                                    ) -
                                      Number(
                                        comparisonSchool.AVG_DEBT.replace(
                                          /,/g,
                                          ""
                                        )
                                      )
                                  ).toLocaleString()}
                                </div>
                                <div className="stat-label">
                                  {Number(
                                    selectedSchool.AVG_DEBT.replace(/,/g, "")
                                  ) <
                                  Number(
                                    comparisonSchool.AVG_DEBT.replace(/,/g, "")
                                  )
                                    ? `LESS DEBT AT ${selectedSchool.NAME}`
                                    : `LESS DEBT AT ${comparisonSchool.NAME}`}
                                </div>
                                <div className="info-icon">
                                  <img
                                    src="/images/black_lightbulb.png"
                                    alt="Info icon"
                                    width="20"
                                    height="20"
                                  />
                                </div>
                                <p className="stat-description">
                                  The typical{" "}
                                  {Number(
                                    selectedSchool.AVG_DEBT.replace(/,/g, "")
                                  ) <
                                  Number(
                                    comparisonSchool.AVG_DEBT.replace(/,/g, "")
                                  )
                                    ? comparisonSchool.NAME
                                    : selectedSchool.NAME}{" "}
                                  student owes
                                  <span
                                    style={{
                                      color: "#f59e0b",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {" "}
                                    the government $
                                    {
                                      getMockData(
                                        Number(
                                          selectedSchool.AVG_DEBT.replace(
                                            /,/g,
                                            ""
                                          )
                                        ) <
                                          Number(
                                            comparisonSchool.AVG_DEBT.replace(
                                              /,/g,
                                              ""
                                            )
                                          )
                                          ? comparisonSchool.NAME
                                          : selectedSchool.NAME
                                      )?.AVG_DEBT
                                    }{" "}
                                    dollars
                                  </span>{" "}
                                  after college. The typical{" "}
                                  {Number(
                                    selectedSchool.AVG_DEBT.replace(/,/g, "")
                                  ) <
                                  Number(
                                    comparisonSchool.AVG_DEBT.replace(/,/g, "")
                                  )
                                    ? selectedSchool.NAME
                                    : comparisonSchool.NAME}{" "}
                                  student
                                  <span
                                    style={{
                                      color: "#f59e0b",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {" "}
                                    owes the government $
                                    {
                                      getMockData(
                                        Number(
                                          selectedSchool.AVG_DEBT.replace(
                                            /,/g,
                                            ""
                                          )
                                        ) <
                                          Number(
                                            comparisonSchool.AVG_DEBT.replace(
                                              /,/g,
                                              ""
                                            )
                                          )
                                          ? selectedSchool.NAME
                                          : comparisonSchool.NAME
                                      )?.AVG_DEBT
                                    }{" "}
                                    dollars
                                  </span>{" "}
                                  after college.
                                </p>
                              </div>
                              {/*                               
                              <div className="stat-card">
                                <div className="stat-value">
                                  {Math.abs(Math.round((Number(selectedSchool.AVG_DEBT) / Number(selectedSchool.AVG_MONTHLY_REPAY)) / 12) - Math.round((Number(comparisonSchool.AVG_DEBT) / Number(comparisonSchool.AVG_MONTHLY_REPAY)) / 12))} years
                                </div>
                                <div className="stat-label">
                                  {Math.round((Number(selectedSchool.AVG_DEBT) / Number(selectedSchool.AVG_MONTHLY_REPAY)) / 12) < Math.round((Number(comparisonSchool.AVG_DEBT) / Number(comparisonSchool.AVG_MONTHLY_REPAY)) / 12)
                                    ? `LESS TO REPAY AT ${selectedSchool.NAME}` 
                                    : `LESS TO REPAY AT ${comparisonSchool.NAME}`}
                                </div>
                                <div className="info-icon"> <img src="/images/black_lightbulb.png" alt="Info icon" width="20" height="20" /> </div>
                                <p className="stat-description">
                                  The typical {Math.round((Number(selectedSchool.AVG_DEBT) / Number(selectedSchool.AVG_MONTHLY_REPAY)) / 12) < Math.round((Number(comparisonSchool.AVG_DEBT) / Number(comparisonSchool.AVG_MONTHLY_REPAY)) / 12) ? comparisonSchool.NAME : selectedSchool.NAME} student
                                  pays off their debt in
                                  <span style={{ color: '#f59e0b', fontWeight: 'bold' }}> {Math.round((Number((Math.round((Number(selectedSchool.AVG_DEBT) / Number(selectedSchool.AVG_MONTHLY_REPAY)) / 12) < Math.round((Number(comparisonSchool.AVG_DEBT) / Number(comparisonSchool.AVG_MONTHLY_REPAY)) / 12) ? comparisonSchool : selectedSchool).AVG_DEBT) / Number((Math.round((Number(selectedSchool.AVG_DEBT) / Number(selectedSchool.AVG_MONTHLY_REPAY)) / 12) < Math.round((Number(comparisonSchool.AVG_DEBT) / Number(comparisonSchool.AVG_MONTHLY_REPAY)) / 12) ? comparisonSchool : selectedSchool).AVG_MONTHLY_REPAY)) / 12)} years after graduating.</span> The typical {Math.round((Number(selectedSchool.AVG_DEBT) / Number(selectedSchool.AVG_MONTHLY_REPAY)) / 12) < Math.round((Number(comparisonSchool.AVG_DEBT) / Number(comparisonSchool.AVG_MONTHLY_REPAY)) / 12) ? selectedSchool.NAME : comparisonSchool.NAME} student
                                  <span style={{ color: '#f59e0b', fontWeight: 'bold' }}> pays off their debt in {Math.round((Number((Math.round((Number(selectedSchool.AVG_DEBT) / Number(selectedSchool.AVG_MONTHLY_REPAY)) / 12) < Math.round((Number(comparisonSchool.AVG_DEBT) / Number(comparisonSchool.AVG_MONTHLY_REPAY)) / 12) ? selectedSchool : comparisonSchool).AVG_DEBT) / Number((Math.round((Number(selectedSchool.AVG_DEBT) / Number(selectedSchool.AVG_MONTHLY_REPAY)) / 12) < Math.round((Number(comparisonSchool.AVG_DEBT) / Number(comparisonSchool.AVG_MONTHLY_REPAY)) / 12) ? selectedSchool : comparisonSchool).AVG_MONTHLY_REPAY)) / 12)} years after graduating.</span>
                                </p>
                              </div> */}

                              <div className="stat-card">
                                <div className="stat-value">
                                  $
                                  {Math.abs(
                                    Number(
                                      selectedSchool.AVG_MONTHLY_REPAY.replace(
                                        /,/g,
                                        ""
                                      )
                                    ) -
                                      Number(
                                        comparisonSchool.AVG_MONTHLY_REPAY.replace(
                                          /,/g,
                                          ""
                                        )
                                      )
                                  ).toLocaleString()}
                                </div>
                                <div className="stat-label">
                                  {Number(
                                    selectedSchool.AVG_MONTHLY_REPAY.replace(
                                      /,/g,
                                      ""
                                    )
                                  ) <
                                  Number(
                                    comparisonSchool.AVG_MONTHLY_REPAY.replace(
                                      /,/g,
                                      ""
                                    )
                                  )
                                    ? `LESS PER MONTH AT ${selectedSchool.NAME}`
                                    : `LESS PER MONTH AT ${comparisonSchool.NAME}`}
                                </div>
                                <div className="info-icon">
                                  {" "}
                                  <img
                                    src="/images/black_lightbulb.png"
                                    alt="Info icon"
                                    width="20"
                                    height="20"
                                  />{" "}
                                </div>
                                <p className="stat-description">
                                  The typical{" "}
                                  {Number(
                                    selectedSchool.AVG_MONTHLY_REPAY.replace(
                                      /,/g,
                                      ""
                                    )
                                  ) <
                                  Number(
                                    comparisonSchool.AVG_MONTHLY_REPAY.replace(
                                      /,/g,
                                      ""
                                    )
                                  )
                                    ? comparisonSchool.NAME
                                    : selectedSchool.NAME}{" "}
                                  student pays off
                                  <span
                                    style={{
                                      color: "#f59e0b",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {" "}
                                    $
                                    {
                                      getMockData(
                                        Number(
                                          selectedSchool.AVG_MONTHLY_REPAY.replace(
                                            /,/g,
                                            ""
                                          )
                                        ) <
                                          Number(
                                            comparisonSchool.AVG_MONTHLY_REPAY.replace(
                                              /,/g,
                                              ""
                                            )
                                          )
                                          ? comparisonSchool.NAME
                                          : selectedSchool.NAME
                                      )?.AVG_MONTHLY_REPAY
                                    }{" "}
                                    of their debt each month
                                  </span>
                                  . The typical{" "}
                                  {Number(
                                    selectedSchool.AVG_MONTHLY_REPAY.replace(
                                      /,/g,
                                      ""
                                    )
                                  ) <
                                  Number(
                                    comparisonSchool.AVG_MONTHLY_REPAY.replace(
                                      /,/g,
                                      ""
                                    )
                                  )
                                    ? selectedSchool.NAME
                                    : comparisonSchool.NAME}{" "}
                                  student pays off
                                  <span
                                    style={{
                                      color: "#f59e0b",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {" "}
                                    $
                                    {
                                      getMockData(
                                        Number(
                                          selectedSchool.AVG_MONTHLY_REPAY.replace(
                                            /,/g,
                                            ""
                                          )
                                        ) <
                                          Number(
                                            comparisonSchool.AVG_MONTHLY_REPAY.replace(
                                              /,/g,
                                              ""
                                            )
                                          )
                                          ? selectedSchool.NAME
                                          : comparisonSchool.NAME
                                      )?.AVG_MONTHLY_REPAY
                                    }{" "}
                                    of their debt each month
                                  </span>
                                  .
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {activeTab === "EXPECTED AID" && (
                      <div className="financial-info">
                        {selectedSchool && comparisonSchool && (
                          <div
                            className="expected-aid-comparison"
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "flex-end",
                              justifyContent: "center",
                              gap: "15px",
                              padding: "10px",
                              width: "100%",
                              maxWidth: "100%",
                              margin: "0 auto",
                              boxSizing: "border-box",
                              overflow: "hidden", // Prevent overflow
                            }}
                          >
                            {/* Calculator buttons row - responsive */}
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "flex-end",
                                gap: "clamp(20px, 5vw, 60px)", // Responsive gap
                                justifyContent: "center",
                                flexWrap: "wrap", // Allow wrapping on very small screens
                                width: "100%",
                                maxWidth: "100%",
                              }}
                            >
                              {/* School 1 Name and Calculator */}
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  gap: "8px",
                                  flex: "0 0 auto", // Don't grow or shrink
                                  minWidth: "140px", // Smaller minimum width
                                  maxWidth: "160px", // Constrain maximum width
                                  marginBottom: "4rem",
                                  fontFamily: "Outfit, sans-serif",
                                }}
                              >
                                <h3
                                  style={{
                                    margin: "0",
                                    fontSize: "clamp(18px, 2vw, 22px)", // Responsive font size
                                    fontWeight: "bold",
                                    textAlign: "left",
                                    color: "#f59e0b",
                                    width: "100%",
                                    lineHeight: "1.2",
                                    wordBreak: "break-word", // Handle long school names
                                  }}
                                >
                                  {selectedSchool.NAME}
                                </h3>
                                <div
                                  className="calc-container2"
                                  style={{
                                    position: "relative",
                                    zIndex: 10,
                                    padding: "0",
                                    borderRadius: "6px",
                                    backgroundColor: "#fff",
                                    width: "100%",
                                    minWidth: "140px",
                                    maxWidth: "200px",
                                  }}
                                >
                                  <a
                                    // href={`https://${selectedSchool.FINANCIAL_AID_CALC}`}
                                    href={normalizeLink(selectedSchool?.FINANCIAL_AID_CALC || '')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="calculator-button"
                                    style={{
                                      textDecoration: "none",
                                      color: "inherit",
                                    }}
                                  >
                                    <h2
                                      className="calculator-title"
                                      style={{
                                        fontSize: "clamp(15px, 1.5vw, 20px)",
                                        margin: "0 0 6px 0",
                                        lineHeight: "1.2",
                                        fontFamily: "Outfit, sans-serif",
                                      }}
                                    >
                                      FINANCIAL AID CALCULATOR
                                    </h2>
                                    <div className="calculator-icon-wrapper">
                                      <div className="calculator-icon">
                                        <img
                                          src="/images/calculator.png"
                                          alt="Calculator icon"
                                          width="70"
                                          height="70"
                                        />
                                      </div>
                                    </div>
                                    <p
                                      className="calculator-cta"
                                      style={{
                                        fontSize: "clamp(14px, 1.2vw, 15px)",
                                        margin: "6px 0 0 0",
                                      }}
                                    >
                                      CLICK ME!
                                    </p>
                                  </a>
                                </div>
                              </div>

                              {/* School 2 Name and Calculator */}
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  gap: "8px",
                                  flex: "0 0 auto",
                                  minWidth: "140px",
                                  maxWidth: "200px",
                                  marginBottom: "4rem",
                                  fontFamily: "Outfit, sans-serif",
                                }}
                              >
                                <h3
                                  style={{
                                    margin: "0",
                                    fontSize: "clamp(18px, 2vw, 22px)",
                                    fontWeight: "bolder",
                                    textAlign: "left",
                                    color: "#f59e0b",
                                    width: "100%",
                                    lineHeight: "1.2",
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {comparisonSchool.NAME}
                                </h3>
                                <div
                                  className="calc-container2"
                                  style={{
                                    position: "relative",
                                    zIndex: 10,
                                    padding: "0",
                                    borderRadius: "6px",
                                    backgroundColor: "#fff",
                                    width: "100%",
                                    minWidth: "140px",
                                    maxWidth: "160px",
                                  }}
                                >
                                  <a
                                    href={normalizeLink(comparisonSchool?.FINANCIAL_AID_CALC || '')}
                                    // href={`https://${comparisonSchool.FINANCIAL_AID_CALC}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="calculator-button"
                                    style={{
                                      textDecoration: "none",
                                      color: "inherit",
                                    }}
                                  >
                                    <h2
                                      className="calculator-title"
                                      style={{
                                        fontSize: "clamp(15px, 1.5vw, 20px)",
                                        margin: "0 0 6px 0",
                                        lineHeight: "1.2",
                                      }}
                                    >
                                      FINANCIAL AID CALCULATOR
                                    </h2>
                                    <div className="calculator-icon-wrapper">
                                      <div className="calculator-icon">
                                        <img
                                          src="/images/calculator.png"
                                          alt="Calculator icon"
                                          width="70"
                                          height="70"
                                        />
                                      </div>
                                    </div>
                                    <p
                                      className="calculator-cta"
                                      style={{
                                        fontSize: "clamp(14px, 1.2vw, 15px)",
                                        margin: "6px 0 0 0",
                                      }}
                                    >
                                      CLICK ME!
                                    </p>
                                  </a>
                                </div>
                              </div>
                            </div>

                            {/* Chart - prioritizes full width */}
                            <div
                              style={{
                                width: "100%",
                                maxWidth: "100%",
                                minWidth: "500px",
                                flex: "1 1 auto", // Allow chart to grow and take available space
                                minHeight: "400px", // Ensure minimum chart height
                              }}
                            >
                              <ComparisonExpectedAidChart
                                selectedSchool={selectedSchool}
                                comparisonSchool={comparisonSchool}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === "WHAT'S THE VALUE OF GOING" &&
                      selectedSchool &&
                      comparisonSchool && (
                        <div
                          className="value-info"
                          style={{
                            display: "flex",
                            flexDirection: "row",
                          }}
                        >
                          {/* Median Earnings Comparison Chart */}
                          <ComparisonMedianEarningsChart
                            selectedSchool={selectedSchool}
                            comparisonSchool={comparisonSchool}
                          />

                          <div
                            className="stat-cards"
                            style={{
                              alignItems: "flex-start",
                              marginRight: "0",
                            }}
                          >
                            <div
                              className="stat-card"
                              style={{
                                height: "100px",
                                width: "300px",
                                marginTop: "1.5rem",
                              }}
                            >
                              <div className="stat-value">
                                $
                                {Math.abs(
                                  Number(
                                    selectedSchool.SCHOOL_MEDIAN_EARNINGS.replace(
                                      /,/g,
                                      ""
                                    )
                                  ) -
                                    Number(
                                      comparisonSchool.SCHOOL_MEDIAN_EARNINGS.replace(
                                        /,/g,
                                        ""
                                      )
                                    )
                                ).toLocaleString()}
                              </div>
                              <div className="stat-label">
                                {Number(
                                  selectedSchool.SCHOOL_MEDIAN_EARNINGS.replace(
                                    /,/g,
                                    ""
                                  )
                                ) >
                                Number(
                                  comparisonSchool.SCHOOL_MEDIAN_EARNINGS.replace(
                                    /,/g,
                                    ""
                                  )
                                )
                                  ? `MORE EARNED AT ${selectedSchool.NAME}`
                                  : `MORE EARNED AT ${comparisonSchool.NAME}`}
                              </div>
                              <div className="info-icon">
                                <img
                                  src="/images/black_lightbulb.png"
                                  alt="Info icon"
                                  width="20"
                                  height="20"
                                />
                              </div>
                              <p className="stat-description">
                                After 10 years have passed since attending
                                college, the typical{" "}
                                {Number(
                                  selectedSchool.SCHOOL_MEDIAN_EARNINGS.replace(
                                    /,/g,
                                    ""
                                  )
                                ) >
                                Number(
                                  comparisonSchool.SCHOOL_MEDIAN_EARNINGS.replace(
                                    /,/g,
                                    ""
                                  )
                                )
                                  ? selectedSchool.NAME
                                  : comparisonSchool.NAME}{" "}
                                student makes{" "}
                                <span
                                  style={{
                                    color: "#f59e0b",
                                    fontWeight: "bold",
                                  }}
                                >
                                  $
                                  {Math.abs(
                                    Number(
                                      selectedSchool.SCHOOL_MEDIAN_EARNINGS.replace(
                                        /,/g,
                                        ""
                                      )
                                    ) -
                                      Number(
                                        comparisonSchool.SCHOOL_MEDIAN_EARNINGS.replace(
                                          /,/g,
                                          ""
                                        )
                                      )
                                  ).toLocaleString()}{" "}
                                  more in one year
                                </span>{" "}
                                than the typical{" "}
                                {Number(
                                  selectedSchool.SCHOOL_MEDIAN_EARNINGS.replace(
                                    /,/g,
                                    ""
                                  )
                                ) >
                                Number(
                                  comparisonSchool.SCHOOL_MEDIAN_EARNINGS.replace(
                                    /,/g,
                                    ""
                                  )
                                )
                                  ? comparisonSchool.NAME
                                  : selectedSchool.NAME}{" "}
                                student.
                              </p>
                            </div>
                            <div
                              className="stat-card"
                              style={{
                                width: "300px",
                                backgroundColor: "#fef3c7",
                                borderRadius: "20px",
                                height: "90%",
                              }}
                            >
                              <div className="stat-value">
                                +
                                {Math.abs(
                                  Number(
                                    selectedSchool.EARNINGS_VS_HS_GRAD * 100
                                  ) -
                                    Number(
                                      comparisonSchool.EARNINGS_VS_HS_GRAD * 100
                                    )
                                ).toFixed(1)}
                                %
                              </div>
                              <div className="stat-label">
                                {Number(selectedSchool.EARNINGS_VS_HS_GRAD) >
                                Number(comparisonSchool.EARNINGS_VS_HS_GRAD)
                                  ? `CHANCE OF EARNING MORE THAN A HS GRAD AT ${selectedSchool.NAME}`
                                  : `CHANCE OF EARNING MORE THAN A HS GRAD AT ${comparisonSchool.NAME}`}
                              </div>
                              <div className="info-icon">
                                <img
                                  src="/images/black_lightbulb.png"
                                  alt="Info icon"
                                  width="20"
                                  height="20"
                                />
                              </div>
                              <p className="stat-description">
                                About{" "}
                                {Number(
                                  selectedSchool.EARNINGS_VS_HS_GRAD * 100
                                ).toFixed(0)}
                                % of students that attended{" "}
                                {selectedSchool.NAME}{" "}
                                <span
                                  style={{
                                    color: "#f59e0b",
                                    fontWeight: "bold",
                                  }}
                                >
                                  earn more than the typical high school
                                  graduate.
                                </span>{" "}
                                <br /> vs.
                                <br />
                                About{" "}
                                {Number(
                                  comparisonSchool.EARNINGS_VS_HS_GRAD * 100
                                ).toFixed(0)}
                                % of students that attended{" "}
                                {comparisonSchool.NAME}{" "}
                                <span
                                  style={{
                                    color: "#f59e0b",
                                    fontWeight: "bold",
                                  }}
                                >
                                  earn more than the typical high school
                                  graduate.
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                    {activeTab === "DEMOGRAPHICS" &&
                      selectedSchool &&
                      comparisonSchool && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              width: "100%",
                              maxWidth: "100rem",
                              margin: "0 auto",
                              alignItems: "center",
                              textAlign: "center",
                              marginTop: -30,
                            }}
                            className="flex flex-col items-center justify-center w-full py-8"
                          >
                            <h3 className="text-left font-bold text-2xl mb-6">
                              Student Demographics Comparison
                            </h3>

                            {/* Two-column layout for comparison */}
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "40px",
                                width: "100%",
                                maxWidth: "1200px",
                                margin: "0 auto",
                              }}
                            >
                              {/* Selected School Column */}
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  padding: "20px",
                                  borderRadius: "12px",
                                }}
                              >
                                <h4
                                  className="font-bold text-lg mb-4"
                                  style={{ color: "#8B7AA8" }}
                                >
                                  {selectedSchool.NAME}
                                </h4>

                                <div className="flex flex-col lg:flex-row items-center justify-center gap-4 w-full">
                                  {/* Pie Chart */}
                                  <div
                                    style={{ width: "60%", minWidth: "200px" }}
                                  >
                                    <Pie
                                      data={
                                        getDemographicPieDataChartJS(
                                          selectedSchool
                                        )!
                                      }
                                      options={{
                                        responsive: true,
                                        maintainAspectRatio: true,
                                        plugins: {
                                          legend: {
                                            display: false,
                                          },
                                        },
                                      }}
                                    />
                                  </div>

                                  {/* Legend */}
                                  <div
                                    style={{
                                      width: "40%",
                                      minWidth: "150px",
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "8px",
                                      paddingLeft: "10px",
                                    }}
                                  >
                                    {getDemographicPieDataChartJS(
                                      selectedSchool
                                    )!.labels.map((label, index) => (
                                      <div
                                        key={label}
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "8px",
                                          fontSize: "12px",
                                        }}
                                      >
                                        <div
                                          style={{
                                            width: "12px",
                                            height: "12px",
                                            backgroundColor:
                                              getDemographicPieDataChartJS(
                                                selectedSchool
                                              )!.datasets[0].backgroundColor[
                                                index
                                              ],
                                            borderRadius: "2px",
                                          }}
                                        />
                                        <span>{label}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Comparison School Column */}
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  padding: "20px",
                                  borderRadius: "12px",
                                }}
                              >
                                <h4
                                  className="font-bold text-lg mb-4"
                                  style={{ color: "#8B7AA8" }}
                                >
                                  {comparisonSchool.NAME}
                                </h4>

                                <div className="flex flex-col lg:flex-row items-center justify-center gap-4 w-full">
                                  {/* Pie Chart */}
                                  <div
                                    style={{ width: "60%", minWidth: "200px" }}
                                  >
                                    <Pie
                                      data={
                                        getDemographicPieDataChartJS(
                                          comparisonSchool
                                        )!
                                      }
                                      options={{
                                        responsive: true,
                                        maintainAspectRatio: true,
                                        plugins: {
                                          legend: {
                                            display: false,
                                          },
                                        },
                                      }}
                                    />
                                  </div>

                                  {/* Legend */}
                                  <div
                                    style={{
                                      width: "40%",
                                      minWidth: "150px",
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "8px",
                                      paddingLeft: "10px",
                                    }}
                                  >
                                    {getDemographicPieDataChartJS(
                                      comparisonSchool
                                    )!.labels.map((label, index) => (
                                      <div
                                        key={label}
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "8px",
                                          fontSize: "12px",
                                        }}
                                      >
                                        <div
                                          style={{
                                            width: "12px",
                                            height: "12px",
                                            backgroundColor:
                                              getDemographicPieDataChartJS(
                                                comparisonSchool
                                              )!.datasets[0].backgroundColor[
                                                index
                                              ],
                                            borderRadius: "2px",
                                          }}
                                        />
                                        <span>{label}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                    {activeTab === "SCHOLARSHIPS" && (
                      <div className="coming-soon">
                        <div className="coming-soon-icon">🚧</div>
                        <h3 className="coming-soon-text">Coming Soon</h3>
                        <p className="coming-soon-description">
                          We're working on gathering detailed information for
                          this section.
                        </p>
                      </div>
                    )}
                    {activeTab === "STEPS TO APPLY" && selectedSchool && (
                      <div
                        style={{
                          borderRadius: "18px",
                          padding: "2rem 1.5rem",
                          marginTop: "1.5rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "stretch", // ensures all cards are same height
                            gap: "2.5rem",
                            justifyContent: "center",
                            flexWrap: "nowrap", // prevents wrapping
                            width: "100%",
                          }}
                        >
                          {/* Step 1: App Link */}
                          <div
                            style={{
                              textAlign: "center",
                              minWidth: 120,
                              maxWidth:
                                getStepsForSchool(selectedSchool.NAME)
                                  ?.APP_LINK &&
                                getStepsForSchool(selectedSchool.NAME)
                                  ?.APP_LINK !== "N/A"
                                  ? 140
                                  : 220,
                              minHeight: 210,
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            {getStepsForSchool(selectedSchool.NAME)?.APP_LINK &&
                            getStepsForSchool(selectedSchool.NAME)?.APP_LINK !==
                              "N/A" ? (
                              <>
                                <div
                                  style={{
                                    background: "#EEA719",
                                    borderRadius: "50%",
                                    width: 100,
                                    height: 100,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto",
                                    border: "7px solid #FFD07B",
                                    fontSize: 48,
                                  }}
                                >
                                  <img
                                    src="/images/mouse_click.png"
                                    alt="App"
                                    style={{ width: 60, height: 60 }}
                                  />
                                </div>
                                <div
                                  style={{
                                    marginTop: 10,
                                    fontWeight: 600,
                                    fontSize: 14,
                                    color: "#000000",
                                  }}
                                >
                                  Create account
                                  <br />
                                  on{" "}
                                  <a
                                    href={
                                      getStepsForSchool(selectedSchool.NAME)
                                        ?.APP_LINK
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      color: "#3b82f6",
                                      textDecoration: "underline",
                                      fontWeight: 700,
                                    }}
                                  >
                                    {getStepsForSchool(
                                      selectedSchool.NAME
                                    )?.APP_LINK.includes("applytexas")
                                      ? "ApplyTexas.org"
                                      : "Application Site"}
                                  </a>
                                </div>
                              </>
                            ) : (
                              <>
                                <div
                                  style={{
                                    fontSize: 48,
                                    marginBottom: 5,
                                    marginTop: -20,
                                  }}
                                >
                                  <span role="img" aria-label="Coming Soon">
                                    🚧
                                  </span>
                                </div>
                                <div
                                  style={{
                                    marginTop: 5,
                                    fontWeight: 600,
                                    fontSize: 14,
                                    color: "#000000",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "#000000",
                                      fontWeight: 700,
                                      fontSize: 25,
                                    }}
                                  >
                                    Coming Soon
                                  </span>
                                  <br />
                                  <span
                                    style={{
                                      color: "#666",
                                      fontWeight: 400,
                                      fontSize: 12,
                                    }}
                                  >
                                    We're working on gathering detailed
                                    information for this section.
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                          {/* Step 2: Primary Essay */}
                          {getStepsForSchool(selectedSchool.NAME)
                            ?.PRIMARY_ESSAY &&
                            getStepsForSchool(selectedSchool.NAME)
                              ?.PRIMARY_ESSAY !== "N/A" && (
                              <div
                                style={{
                                  textAlign: "center",
                                  minWidth: 120,
                                  maxWidth: 140,
                                  minHeight: 210,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <div
                                  style={{
                                    background: "#DCCFE5",
                                    borderRadius: "50%",
                                    width: 80,
                                    height: 80,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto",
                                    boxShadow: "0 2px 8px #e6e0f3",
                                  }}
                                >
                                  <img
                                    src="/images/pencils.png"
                                    alt="Essay"
                                    style={{ width: 45, height: 45 }}
                                  />
                                </div>
                                <div
                                  style={{
                                    marginTop: 10,
                                    fontWeight: 600,
                                    fontSize: 14,
                                    color: "#7c3aed",
                                  }}
                                >
                                  Write 1 primary essay
                                  <br />
                                  <span
                                    style={{ color: "#222", fontWeight: 400 }}
                                  >
                                    (reuse{" "}
                                    {
                                      getStepsForSchool(selectedSchool.NAME)
                                        ?.PRIMARY_ESSAY
                                    }
                                    )
                                  </span>
                                </div>
                              </div>
                            )}
                          {/* Step 3: Supplementals */}
                          {getStepsForSchool(selectedSchool.NAME)?.NUM_SUPPS &&
                            getStepsForSchool(selectedSchool.NAME)
                              ?.NUM_SUPPS !== "N/A" && (
                              <div
                                style={{
                                  textAlign: "center",
                                  minWidth: 120,
                                  maxWidth: 140,
                                  minHeight: 210,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <div
                                  style={{
                                    background: "#B2E0EA",
                                    borderRadius: "50%",
                                    width: 80,
                                    height: 80,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto",
                                    boxShadow: "0 2px 8px #d1f3f9",
                                  }}
                                >
                                  <img
                                    src="/images/pencils.png"
                                    alt="Supps"
                                    style={{ width: 45, height: 45 }}
                                  />
                                </div>
                                <div
                                  style={{
                                    marginTop: 10,
                                    fontWeight: 600,
                                    fontSize: 14,
                                    color: "#0284c7",
                                  }}
                                >
                                  Write{" "}
                                  {
                                    getStepsForSchool(selectedSchool.NAME)
                                      ?.NUM_SUPPS
                                  }{" "}
                                  supplementals
                                  <br />
                                  {getStepsForSchool(selectedSchool.NAME)
                                    ?.SUPP_LINK &&
                                    getStepsForSchool(selectedSchool.NAME)
                                      ?.SUPP_LINK !== "N/A" && (
                                      <a
                                        href={
                                          getStepsForSchool(selectedSchool.NAME)
                                            ?.SUPP_LINK
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          color: "#0284c7",
                                          textDecoration: "underline",
                                          fontWeight: 700,
                                        }}
                                      >
                                        (prompts linked here!)
                                      </a>
                                    )}
                                </div>
                              </div>
                            )}
                          {/* Step 4: Recs */}
                          {getStepsForSchool(selectedSchool.NAME)?.NUM_RECS &&
                            getStepsForSchool(selectedSchool.NAME)?.NUM_RECS !==
                              "N/A" && (
                              <div
                                style={{
                                  textAlign: "center",
                                  minWidth: 120,
                                  maxWidth: 140,
                                  minHeight: 210,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <div
                                  style={{
                                    background: "#B7E4C7",
                                    borderRadius: "50%",
                                    width: 80,
                                    height: 80,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto",
                                    boxShadow: "0 2px 8px #d1f9e0",
                                  }}
                                >
                                  <img
                                    src="/images/rec_letters.png"
                                    alt="Recs"
                                    style={{ width: 45, height: 45 }}
                                  />
                                </div>
                                <div
                                  style={{
                                    marginTop: 10,
                                    fontWeight: 600,
                                    fontSize: 14,
                                    color: "#059669",
                                  }}
                                >
                                  Get{" "}
                                  {
                                    getStepsForSchool(selectedSchool.NAME)
                                      ?.NUM_RECS
                                  }{" "}
                                  rec letters
                                  <br />
                                  {getStepsForSchool(selectedSchool.NAME)
                                    ?.RECS_LINK &&
                                    getStepsForSchool(selectedSchool.NAME)
                                      ?.RECS_LINK !== "N/A" && (
                                      <a
                                        href={
                                          getStepsForSchool(selectedSchool.NAME)
                                            ?.RECS_LINK
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          color: "#059669",
                                          textDecoration: "underline",
                                          fontWeight: 700,
                                        }}
                                      >
                                        (rules linked here!)
                                      </a>
                                    )}
                                </div>
                              </div>
                            )}
                          {/* Step 5: App Fee */}
                          {getStepsForSchool(selectedSchool.NAME)?.APP_FEE &&
                            getStepsForSchool(selectedSchool.NAME)?.APP_FEE !==
                              "N/A" && (
                              <div
                                style={{
                                  textAlign: "center",
                                  minWidth: 120,
                                  maxWidth: 140,
                                  minHeight: 210,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <div
                                  style={{
                                    background: "#FFD07B",
                                    borderRadius: "50%",
                                    width: 80,
                                    height: 80,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto",
                                    boxShadow: "0 2px 8px #f3e7c1",
                                  }}
                                >
                                  <img
                                    src="/images/financial.png"
                                    alt="Fee"
                                    style={{ width: 45, height: 45 }}
                                  />
                                </div>
                                <div
                                  style={{
                                    marginTop: 10,
                                    fontWeight: 700,
                                    fontSize: 14,
                                    color: "#f59e0b",
                                  }}
                                >
                                  {
                                    getStepsForSchool(selectedSchool.NAME)
                                      ?.APP_FEE
                                  }{" "}
                                  application fee
                                  <br />
                                  {getStepsForSchool(selectedSchool.NAME)
                                    ?.FINANCIAL_WAIVER &&
                                    getStepsForSchool(selectedSchool.NAME)
                                      ?.FINANCIAL_WAIVER !== "N/A" && (
                                      <a
                                        href={
                                          getStepsForSchool(selectedSchool.NAME)
                                            ?.FINANCIAL_WAIVER
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          color: "#d97706",
                                          textDecoration: "underline",
                                          fontWeight: 700,
                                        }}
                                      >
                                        (link to waiver)
                                      </a>
                                    )}
                                </div>
                              </div>
                            )}
                          {/* Step 6: Dates */}
                          {(getStepsForSchool(selectedSchool.NAME)
                            ?.EARLY_DATE &&
                            getStepsForSchool(selectedSchool.NAME)
                              ?.EARLY_DATE !== "N/A") ||
                          (getStepsForSchool(selectedSchool.NAME)
                            ?.REGULAR_DATE &&
                            getStepsForSchool(selectedSchool.NAME)
                              ?.REGULAR_DATE !== "N/A") ? (
                            <div
                              style={{
                                textAlign: "center",
                                minWidth: 120,
                                maxWidth: 140,
                                minHeight: 210,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <div
                                style={{
                                  background: "#DCCFE5",
                                  borderRadius: "50%",
                                  width: 80,
                                  height: 80,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  margin: "0 auto",
                                  boxShadow: "0 2px 8px #e6e0f3",
                                }}
                              >
                                <img
                                  src="/images/deadlines.png"
                                  alt="Dates"
                                  style={{ width: 45, height: 45 }}
                                />
                              </div>
                              <div
                                style={{
                                  marginTop: 10,
                                  fontWeight: 700,
                                  fontSize: 14,
                                  color: "#a21caf",
                                }}
                              >
                                {getStepsForSchool(selectedSchool.NAME)
                                  ?.EARLY_DATE &&
                                  getStepsForSchool(selectedSchool.NAME)
                                    ?.EARLY_DATE !== "N/A" && (
                                    <span>
                                      Early App. due{" "}
                                      {
                                        getStepsForSchool(selectedSchool.NAME)
                                          ?.EARLY_DATE
                                      }
                                      <br />
                                    </span>
                                  )}
                                {getStepsForSchool(selectedSchool.NAME)
                                  ?.REGULAR_DATE &&
                                  getStepsForSchool(selectedSchool.NAME)
                                    ?.REGULAR_DATE !== "N/A" && (
                                    <span>
                                      Regular App. due{" "}
                                      {
                                        getStepsForSchool(selectedSchool.NAME)
                                          ?.REGULAR_DATE
                                      }
                                    </span>
                                  )}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="school-header">
                  <div className="school-icon school-cap-icon">
                    <img
                      src="/images/Cap.png"
                      alt="Grad_Cap"
                      className="category-logo"
                    />
                  </div>
                  <h2 className="school-name">{selectedSchool?.NAME}</h2>
                </div>

                <div className="school-tabs">
                  <div className="tabs-container">
                    {schoolTabs.map((tab) => {
                      const isDisabled =
                        comparisonSchool &&
                        (tab === "SCHOLARSHIPS" || tab === "STEPS TO APPLY");
                      return (
                        <button
                          key={tab}
                          onClick={() => !isDisabled && setActiveTab(tab)}
                          className={`tab ${
                            activeTab === tab ? "active-tab" : ""
                          } ${isDisabled ? "disabled-tab" : ""}`}
                          style={{
                            opacity: isDisabled ? 0.5 : 1,
                            cursor: isDisabled ? "not-allowed" : "pointer",
                            color: isDisabled ? "#999" : undefined,
                            backgroundColor: isDisabled ? "#f5f5f5" : undefined,
                          }}
                          disabled={!!isDisabled}
                        >
                          {tab}
                        </button>
                      );
                    })}
                  </div>

                  <div className="tab-content">
                    {activeTab === "COST OF ENROLLMENT" && selectedSchool && (
                      <div className="financial-info">
                        <div className="stat-cards-enrollment">
                          <div className="stat-card">
                            <div className="stat-value">
                              ${getMockData(selectedSchool.NAME)?.AVG_DEBT}
                            </div>
                            <div className="stat-label">AVG. DEBT</div>
                            <div className="info-icon">
                              <img
                                src="/images/black_lightbulb.png"
                                alt="Info icon"
                                width="20"
                                height="20"
                              />
                            </div>
                            <p className="stat-description">
                              The typical {selectedSchool.NAME} student takes
                              out
                              <span
                                style={{ color: "#f59e0b", fontWeight: "bold" }}
                              >
                                {" "}
                                ${getMockData(selectedSchool.NAME)?.AVG_DEBT} of
                                federal loans{" "}
                              </span>
                              to help with college costs. This means they
                              <span
                                style={{ color: "#f59e0b", fontWeight: "bold" }}
                              >
                                {" "}
                                owe the government $
                                {
                                  getMockData(selectedSchool.NAME)?.AVG_DEBT
                                }{" "}
                              </span>
                              after college.
                            </p>
                          </div>

                          {/* <div className="stat-card">
                            <div className="stat-value">{Math.round((Number(selectedSchool.AVG_DEBT) / Number(selectedSchool.AVG_MONTHLY_REPAY)) / 12)} years</div>
                            <div className="stat-label">AVG. REPAY TIME</div>
                            <div className="info-icon">
                              <img src="/images/black_lightbulb.png" alt="Info icon" width="20" height="20" />
                            </div>
                            <p className="stat-description">
                              The typical {selectedSchool.NAME} student pays off their debt in 
                              <span style={{ color: '#f59e0b', fontWeight: 'bold' }}> {Math.round((Number(selectedSchool.AVG_DEBT) / Number(selectedSchool.AVG_MONTHLY_REPAY)) / 12)} years after graduating.</span>
                            </p>
                          </div> */}

                          <div className="stat-card">
                            <div className="stat-value">
                              $
                              {
                                getMockData(selectedSchool.NAME)
                                  ?.AVG_MONTHLY_REPAY
                              }
                            </div>
                            <div className="stat-label">AVG. MONTHLY RATE</div>
                            <div className="info-icon">
                              <img
                                src="/images/black_lightbulb.png"
                                alt="Info icon"
                                width="20"
                                height="20"
                              />
                            </div>
                            <p className="stat-description">
                              The typical {selectedSchool.NAME} student pays off
                              <span
                                style={{ color: "#f59e0b", fontWeight: "bold" }}
                              >
                                {" "}
                                $
                                {
                                  getMockData(selectedSchool.NAME)
                                    ?.AVG_MONTHLY_REPAY
                                }{" "}
                                of their debt each month
                              </span>
                              . This requires less than
                              <span
                                style={{ color: "#f59e0b", fontWeight: "bold" }}
                              >
                                {" "}
                                {
                                  getMockData(selectedSchool.NAME)
                                    ?.MONTHLY_REPAY_PERCENTAGE
                                }
                                % of their annual income
                              </span>
                              .
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "EXPECTED AID" && selectedSchool && (
                      <div
                        className="financial-info"
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "flex-start",
                          justifyContent: "center",
                          gap: "60px",
                          paddingTop: "0px",
                          paddingLeft: "0px",
                          maxWidth: "100rem",
                          margin: "0 auto",
                        }}
                      >
                        {/* Left: Calculator */}
                        <div
                          className="calc-container2"
                          style={{
                            position: "relative",
                            zIndex: 10,
                            padding: "20px",
                            borderRadius: "8px",

                            backgroundColor: "#fff",
                            width: "300px",
                          }}
                        >
                          <a
                            // https://${selectedSchool.
                            // href={`FINANCIAL_AID_CALC`}
                            href={normalizeLink(selectedSchool?.FINANCIAL_AID_CALC || '')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="calculator-button"
                            style={{ textDecoration: "none", color: "inherit" }}
                          >
                            <h2 className="calculator-title">
                              FINANCIAL AID CALCULATOR
                            </h2>
                            <div className="calculator-icon-wrapper">
                              <div className="calculator-icon">
                                <img
                                  src="/images/calculator.png"
                                  alt="Calculator icon"
                                  width="70"
                                  height="70"
                                />
                              </div>
                            </div>
                            <p className="calculator-cta">CLICK ME!</p>
                          </a>
                        </div>

                        {/* Right: Chart */}
                        <div
                          style={{
                            width: "70%",
                            maxWidth: "600px",
                          }}
                        >
                          <ExpectedAidChart school={selectedSchool} />
                        </div>
                      </div>
                    )}

                    {activeTab === "WHAT'S THE VALUE OF GOING" &&
                      selectedSchool && (
                        <div className="value-info">
                          <div className="stat-cards">
                            <div className="stat-card">
                              <div className="stat-value">
                                $
                                {
                                  getMockData(selectedSchool.NAME)
                                    ?.SCHOOL_MEDIAN_EARNINGS
                                }
                              </div>
                              <div className="stat-label">MEDIAN EARNINGS</div>
                              <div className="info-icon">
                                <img
                                  src="/images/black_lightbulb.png"
                                  alt="Info icon"
                                  width="20"
                                  height="20"
                                />
                              </div>
                              <p className="stat-description">
                                The typical {selectedSchool.NAME} student (who
                                received aid) makes about
                                <span
                                  style={{
                                    color: "#f59e0b",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {" "}
                                  $
                                  {
                                    getMockData(selectedSchool.NAME)
                                      ?.SCHOOL_MEDIAN_EARNINGS
                                  }{" "}
                                  in a year after 10 years have passed{" "}
                                </span>
                                since they attended {selectedSchool.NAME}.
                              </p>
                            </div>

                            <div className="vs-divider">VS.</div>

                            <div className="stat-card">
                              <div className="stat-value">
                                $
                                {
                                  getMockData(selectedSchool.NAME)
                                    ?.NATIONAL_4_YEAR_MEDIAN
                                }
                              </div>
                              <div className="stat-label">NATIONAL MEDIAN</div>
                              <div className="info-icon">
                                <img
                                  src="/images/black_lightbulb.png"
                                  alt="Info icon"
                                  width="20"
                                  height="20"
                                />
                              </div>
                              <p className="stat-description">
                                The typical American citizen (who received aid)
                                makes about
                                <span
                                  style={{
                                    color: "#f59e0b",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {" "}
                                  $
                                  {
                                    getMockData(selectedSchool.NAME)
                                      ?.NATIONAL_4_YEAR_MEDIAN
                                  }{" "}
                                  in a year after 10 years have passed{" "}
                                </span>
                                since they attended a 4-year college.
                              </p>
                            </div>

                            <div
                              className="stat-card"
                              style={{
                                backgroundColor: "#fef3c7",
                                borderRadius: "20px",
                                height: "100%",
                                width: "80%",
                              }}
                            >
                              <div className="stat-value">
                                {
                                  getMockData(selectedSchool.NAME)
                                    ?.EARNINGS_VS_HS_GRAD
                                }
                                %
                              </div>
                              <div className="stat-label">
                                EARNINGS ADVANTAGE
                              </div>
                              <div className="info-icon">
                                <img
                                  src="/images/black_lightbulb.png"
                                  alt="Info icon"
                                  width="20"
                                  height="20"
                                />
                              </div>
                              <p className="stat-description">
                                About{" "}
                                {
                                  getMockData(selectedSchool.NAME)
                                    ?.EARNINGS_VS_HS_GRAD
                                }
                                % of students that entered {selectedSchool.NAME}{" "}
                                6 years ago
                                <span
                                  style={{
                                    color: "#f59e0b",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {" "}
                                  earn more than a typical high school grad.
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                    {activeTab === "DEMOGRAPHICS" && selectedSchool && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: "100%",
                            maxWidth: "100rem",
                            margin: "0 auto",
                            alignItems: "center",
                            textAlign: "center",
                            marginTop: -30,
                          }}
                          className="flex flex-col items-center justify-center w-full py-8"
                        >
                          <h3 className="text-left font-bold text-2xl mb-6">
                            Student Demographics – {selectedSchool.NAME}
                          </h3>

                          <div className="flex flex-col lg:flex-row items-center justify-center gap-2 w-full max-w-4xl mx-auto">
                            {/* Left side: Large Pie Chart */}
                            <div style={{ width: "30%" }}>
                              <Pie
                                data={
                                  getDemographicPieDataChartJS(selectedSchool)!
                                }
                                options={{
                                  responsive: true,
                                  plugins: {
                                    legend: {
                                      display: false, // We'll place legend manually
                                    },
                                  },
                                }}
                              />
                            </div>

                            {/* Right side: Legend */}
                            <div
                              style={{
                                width: "50%",
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(2, minmax(100px, 1fr))",
                                gap: "10px",
                                paddingLeft: "30px",
                                paddingTop: "10px",
                              }}
                            >
                              {getDemographicPieDataChartJS(
                                selectedSchool
                              )!.labels.map((label, index) => (
                                <div
                                  key={label}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "16px",
                                      height: "16px",
                                      backgroundColor:
                                        getDemographicPieDataChartJS(
                                          selectedSchool
                                        )!.datasets[0].backgroundColor[index],
                                    }}
                                  />
                                  <span>{label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "SCHOLARSHIPS" && (
                      <div className="coming-soon">
                        <div className="coming-soon-icon">🚧</div>
                        <h3 className="coming-soon-text">Coming Soon</h3>
                        <p className="coming-soon-description">
                          We're working on gathering detailed information for
                          this section.
                        </p>
                      </div>
                    )}
                    {activeTab === "STEPS TO APPLY" && selectedSchool && (
                      <div
                        style={{
                          borderRadius: "18px",
                          padding: "2rem 1.5rem",
                          marginTop: "1.5rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "stretch", // ensures all cards are same height
                            gap: "2.5rem",
                            justifyContent: "center",
                            flexWrap: "nowrap", // prevents wrapping
                            width: "100%",
                          }}
                        >
                          {/* Step 1: App Link */}
                          <div
                            style={{
                              textAlign: "center",
                              minWidth: 120,
                              maxWidth:
                                getStepsForSchool(selectedSchool.NAME)
                                  ?.APP_LINK &&
                                getStepsForSchool(selectedSchool.NAME)
                                  ?.APP_LINK !== "N/A"
                                  ? 140
                                  : 500,
                              minHeight: 210,
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            {getStepsForSchool(selectedSchool.NAME)?.APP_LINK &&
                            getStepsForSchool(selectedSchool.NAME)?.APP_LINK !==
                              "N/A" ? (
                              <>
                                <div
                                  style={{
                                    background: "#EEA719",
                                    borderRadius: "50%",
                                    width: 100,
                                    height: 100,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto",
                                    border: "7px solid #FFD07B",
                                    fontSize: 48,
                                  }}
                                >
                                  <img
                                    src="/images/mouse_click.png"
                                    alt="App"
                                    style={{ width: 60, height: 60 }}
                                  />
                                </div>
                                <div
                                  style={{
                                    marginTop: 10,
                                    fontWeight: 600,
                                    fontSize: 14,
                                    color: "#000000",
                                  }}
                                >
                                  Create account
                                  <br />
                                  on{" "}
                                  <a
                                    href={
                                      getStepsForSchool(selectedSchool.NAME)
                                        ?.APP_LINK
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      color: "#3b82f6",
                                      textDecoration: "underline",
                                      fontWeight: 700,
                                    }}
                                  >
                                    {getStepsForSchool(
                                      selectedSchool.NAME
                                    )?.APP_LINK.includes("applytexas")
                                      ? "ApplyTexas.org"
                                      : "Application Site"}
                                  </a>
                                </div>
                              </>
                            ) : (
                              <>
                                <div
                                  style={{
                                    fontSize: 48,
                                    marginBottom: 5,
                                    marginTop: -20,
                                  }}
                                >
                                  <span role="img" aria-label="Coming Soon">
                                    🚧
                                  </span>
                                </div>
                                <div
                                  style={{
                                    marginTop: 5,
                                    fontWeight: 600,
                                    fontSize: 14,
                                    color: "#000000",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "#000000",
                                      fontWeight: 700,
                                      fontSize: 25,
                                    }}
                                  >
                                    Coming Soon
                                  </span>
                                  <br />
                                  <span
                                    style={{
                                      color: "#666",
                                      fontWeight: 400,
                                      fontSize: 16,
                                    }}
                                  >
                                    We're working on gathering detailed
                                    information for this section.
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                          {/* Step 2: Primary Essay */}
                          {getStepsForSchool(selectedSchool.NAME)
                            ?.PRIMARY_ESSAY &&
                            getStepsForSchool(selectedSchool.NAME)
                              ?.PRIMARY_ESSAY !== "N/A" && (
                              <div
                                style={{
                                  textAlign: "center",
                                  minWidth: 120,
                                  maxWidth: 140,
                                  minHeight: 210,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <div
                                  style={{
                                    background: "#9B7FC9",
                                    borderRadius: "50%",
                                    width: 100,
                                    height: 100,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto",
                                    border: "7px solid #DCCFE5",
                                  }}
                                >
                                  <img
                                    src="/images/pencils.png"
                                    alt="Essay"
                                    style={{ width: 45, height: 45 }}
                                  />
                                </div>
                                <div
                                  style={{
                                    marginTop: 10,
                                    fontWeight: 600,
                                    fontSize: 14,
                                    color: "#000000",
                                  }}
                                >
                                  Write 1 primary essay
                                  <br />
                                  <span
                                    style={{
                                      color: "#000000",
                                      fontWeight: 700,
                                    }}
                                  >
                                    (reuse{" "}
                                    {
                                      getStepsForSchool(selectedSchool.NAME)
                                        ?.PRIMARY_ESSAY
                                    }
                                    )
                                  </span>
                                </div>
                              </div>
                            )}
                          {/* Step 3: Supplementals */}
                          {getStepsForSchool(selectedSchool.NAME)?.NUM_SUPPS &&
                            getStepsForSchool(selectedSchool.NAME)
                              ?.NUM_SUPPS !== "N/A" && (
                              <div
                                style={{
                                  textAlign: "center",
                                  minWidth: 120,
                                  maxWidth: 160,
                                  minHeight: 210,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <div
                                  style={{
                                    background: "#51879E",
                                    borderRadius: "50%",
                                    width: 100,
                                    height: 100,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto",
                                    border: "7px solid #B7CDED",
                                  }}
                                >
                                  <img
                                    src="/images/pencils.png"
                                    alt="Supps"
                                    style={{ width: 45, height: 45 }}
                                  />
                                </div>
                                <div
                                  style={{
                                    marginTop: 10,
                                    fontWeight: 600,
                                    fontSize: 14,
                                    color: "#000000",
                                  }}
                                >
                                  Write{" "}
                                  {
                                    getStepsForSchool(selectedSchool.NAME)
                                      ?.NUM_SUPPS
                                  }{" "}
                                  supplementals
                                  <br />
                                  {getStepsForSchool(selectedSchool.NAME)
                                    ?.SUPP_LINK &&
                                    getStepsForSchool(selectedSchool.NAME)
                                      ?.SUPP_LINK !== "N/A" && (
                                      <a
                                        href={
                                          getStepsForSchool(selectedSchool.NAME)
                                            ?.SUPP_LINK
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          color: "#3b82f6",
                                          textDecoration: "underline",
                                          fontWeight: 700,
                                        }}
                                      >
                                        (prompts linked here!)
                                      </a>
                                    )}
                                </div>
                              </div>
                            )}
                          {/* Step 4: Recs */}
                          {getStepsForSchool(selectedSchool.NAME)?.NUM_RECS &&
                            getStepsForSchool(selectedSchool.NAME)?.NUM_RECS !==
                              "N/A" && (
                              <div
                                style={{
                                  textAlign: "center",
                                  minWidth: 120,
                                  maxWidth: 140,
                                  minHeight: 210,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <div
                                  style={{
                                    background: "#70B277",
                                    borderRadius: "50%",
                                    width: 100,
                                    height: 100,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto",
                                    border: "7px solid #A6D8AC",
                                  }}
                                >
                                  <img
                                    src="/images/rec_letters.png"
                                    alt="Recs"
                                    style={{ width: 45, height: 45 }}
                                  />
                                </div>
                                <div
                                  style={{
                                    marginTop: 10,
                                    fontWeight: 600,
                                    fontSize: 14,
                                    color: "#000000",
                                  }}
                                >
                                  Get{" "}
                                  {
                                    getStepsForSchool(selectedSchool.NAME)
                                      ?.NUM_RECS
                                  }{" "}
                                  rec letters
                                  <br />
                                  {getStepsForSchool(selectedSchool.NAME)
                                    ?.RECS_LINK &&
                                    getStepsForSchool(selectedSchool.NAME)
                                      ?.RECS_LINK !== "N/A" && (
                                      <a
                                        href={
                                          getStepsForSchool(selectedSchool.NAME)
                                            ?.RECS_LINK
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          color: "#3b82f6",
                                          textDecoration: "underline",
                                          fontWeight: 700,
                                        }}
                                      >
                                        (rules linked here!)
                                      </a>
                                    )}
                                </div>
                              </div>
                            )}
                          {/* Step 5: App Fee */}
                          {getStepsForSchool(selectedSchool.NAME)?.APP_FEE &&
                            getStepsForSchool(selectedSchool.NAME)?.APP_FEE !==
                              "N/A" && (
                              <div
                                style={{
                                  textAlign: "center",
                                  minWidth: 120,
                                  maxWidth: 140,
                                  minHeight: 210,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <div
                                  style={{
                                    background: "#EEA719",
                                    borderRadius: "50%",
                                    width: 100,
                                    height: 100,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto",
                                    border: "7px solid #FFD07B",
                                  }}
                                >
                                  <img
                                    src="/images/financial.png"
                                    alt="Fee"
                                    style={{ width: 60, height: 60 }}
                                  />
                                </div>
                                <div
                                  style={{
                                    marginTop: 10,
                                    fontWeight: 700,
                                    fontSize: 14,
                                    color: "#E33A3A",
                                  }}
                                >
                                  {
                                    getStepsForSchool(selectedSchool.NAME)
                                      ?.APP_FEE
                                  }{" "}
                                  application fee
                                  <br />
                                  {getStepsForSchool(selectedSchool.NAME)
                                    ?.FINANCIAL_WAIVER &&
                                    getStepsForSchool(selectedSchool.NAME)
                                      ?.FINANCIAL_WAIVER !== "N/A" && (
                                      <a
                                        href={
                                          getStepsForSchool(selectedSchool.NAME)
                                            ?.FINANCIAL_WAIVER
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          color: "#3b82f6",
                                          textDecoration: "underline",
                                          fontWeight: 700,
                                        }}
                                      >
                                        (link to waiver)
                                      </a>
                                    )}
                                </div>
                              </div>
                            )}
                          {/* Step 6: Dates */}
                          {(getStepsForSchool(selectedSchool.NAME)
                            ?.EARLY_DATE &&
                            getStepsForSchool(selectedSchool.NAME)
                              ?.EARLY_DATE !== "N/A") ||
                          (getStepsForSchool(selectedSchool.NAME)
                            ?.REGULAR_DATE &&
                            getStepsForSchool(selectedSchool.NAME)
                              ?.REGULAR_DATE !== "N/A") ? (
                            <div
                              style={{
                                textAlign: "center",
                                minWidth: 120,
                                maxWidth: 160,
                                minHeight: 210,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <div
                                style={{
                                  background: "#9B7FC9",
                                  borderRadius: "50%",
                                  width: 100,
                                  height: 100,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  margin: "0 auto",
                                  border: "7px solid #DCCFE5",
                                }}
                              >
                                <img
                                  src="/images/deadlines.png"
                                  alt="Dates"
                                  style={{ width: 60, height: 60 }}
                                />
                              </div>
                              <div
                                style={{
                                  marginTop: 10,
                                  fontWeight: 700,
                                  fontSize: 14,
                                  color: "#E33A3A",
                                }}
                              >
                                {getStepsForSchool(selectedSchool.NAME)
                                  ?.EARLY_DATE &&
                                  getStepsForSchool(selectedSchool.NAME)
                                    ?.EARLY_DATE !== "N/A" && (
                                    <span>
                                      Early App. due{" "}
                                      {
                                        getStepsForSchool(selectedSchool.NAME)
                                          ?.EARLY_DATE
                                      }
                                      <br />
                                    </span>
                                  )}
                                {getStepsForSchool(selectedSchool.NAME)
                                  ?.REGULAR_DATE &&
                                  getStepsForSchool(selectedSchool.NAME)
                                    ?.REGULAR_DATE !== "N/A" && (
                                    <span>
                                      Regular App. due{" "}
                                      {
                                        getStepsForSchool(selectedSchool.NAME)
                                          ?.REGULAR_DATE
                                      }
                                    </span>
                                  )}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}