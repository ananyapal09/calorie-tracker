import React, { useState } from "react";

function BMI() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState(null);
  const [category, setCategory] = useState("");

  const calculateBMI = (e) => {
    e.preventDefault();

    if (!height || !weight || height <= 0 || weight <= 0) {
      return;
    }

    const heightInMeters = Number(height) / 100;
    const bmiValue = Number(
      Number(weight) / (heightInMeters * heightInMeters)
    ).toFixed(1);

    setBmi(bmiValue);

    if (bmiValue < 18.5) {
      setCategory("Underweight");
    } else if (bmiValue < 25) {
      setCategory("Normal Weight");
    } else if (bmiValue < 30) {
      setCategory("Overweight");
    } else {
      setCategory("Obese");
    }
  };

  const getCategoryClass = () => {
    if (!bmi) return "";

    if (bmi < 18.5) return "text-info";
    if (bmi < 25) return "text-success";
    if (bmi < 30) return "text-warning";
    return "text-danger";
  };

  return (
    <div
      className="bmi-page"
      style={{
        minHeight: "calc(100vh - 70px)",
        background: "#f5f8f7",
        padding: "55px 20px 80px",
      }}
    >
      {/* Header */}
      <div className="text-center mb-5">
        <div
          style={{
            width: "72px",
            height: "72px",
            margin: "0 auto 20px",
            borderRadius: "20px",
            background: "#e8f7f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "34px",
          }}
        >
          ⚖️
        </div>

        <h1
          style={{
            fontWeight: "700",
            fontSize: "42px",
            color: "#20252b",
            marginBottom: "12px",
          }}
        >
          BMI Calculator
        </h1>

        <p
          style={{
            color: "#7a858e",
            fontSize: "18px",
            margin: 0,
          }}
        >
          Check your Body Mass Index and get a quick overview of your weight
          category.
        </p>
      </div>

      {/* Calculator Card */}
      <div
        className="mx-auto"
        style={{
          maxWidth: "775px",
          background: "#ffffff",
          borderRadius: "22px",
          padding: "38px",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.08)",
        }}
      >
        <h2
          style={{
            fontSize: "25px",
            fontWeight: "700",
            color: "#20252b",
            marginBottom: "6px",
          }}
        >
          Calculate Your BMI
        </h2>

        <p
          style={{
            color: "#7a858e",
            fontSize: "17px",
            marginBottom: "32px",
          }}
        >
          Enter your height and weight below
        </p>

        <form onSubmit={calculateBMI}>
          {/* Height */}
          <div className="mb-4">
            <label
              className="form-label"
              style={{
                fontWeight: "600",
                fontSize: "16px",
                color: "#3d454c",
              }}
            >
              Height
            </label>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #dfe5e8",
                borderRadius: "13px",
                height: "58px",
                overflow: "hidden",
                background: "#fff",
              }}
            >
              <input
                type="number"
                min="1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="Enter your height"
                style={{
                  flex: 1,
                  height: "100%",
                  border: "none",
                  outline: "none",
                  padding: "0 17px",
                  fontSize: "16px",
                  color: "#333",
                }}
              />

              <span
                style={{
                  padding: "0 18px",
                  borderLeft: "1px solid #e5e9eb",
                  color: "#727c84",
                  fontWeight: "600",
                }}
              >
                cm
              </span>
            </div>
          </div>

          {/* Weight */}
          <div className="mb-4">
            <label
              className="form-label"
              style={{
                fontWeight: "600",
                fontSize: "16px",
                color: "#3d454c",
              }}
            >
              Weight
            </label>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #dfe5e8",
                borderRadius: "13px",
                height: "58px",
                overflow: "hidden",
                background: "#fff",
              }}
            >
              <input
                type="number"
                min="1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Enter your weight"
                style={{
                  flex: 1,
                  height: "100%",
                  border: "none",
                  outline: "none",
                  padding: "0 17px",
                  fontSize: "16px",
                  color: "#333",
                }}
              />

              <span
                style={{
                  padding: "0 18px",
                  borderLeft: "1px solid #e5e9eb",
                  color: "#727c84",
                  fontWeight: "600",
                }}
              >
                kg
              </span>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-100"
            style={{
              height: "60px",
              border: "none",
              borderRadius: "13px",
              background: "#198754",
              color: "#fff",
              fontSize: "17px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#157347";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#198754";
            }}
          >
            Calculate BMI <span style={{ marginLeft: "8px" }}>→</span>
          </button>
        </form>

        {/* Result */}
        {bmi && (
          <div
            className="text-center mt-4"
            style={{
              padding: "25px",
              borderRadius: "16px",
              background: "#f5faf7",
              border: "1px solid #dcefe5",
            }}
          >
            <p
              style={{
                marginBottom: "5px",
                color: "#727c84",
                fontSize: "15px",
              }}
            >
              Your BMI
            </p>

            <div
              style={{
                fontSize: "42px",
                fontWeight: "700",
                color: "#198754",
              }}
            >
              {bmi}
            </div>

            <div
              className={getCategoryClass()}
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginTop: "3px",
              }}
            >
              {category}
            </div>
          </div>
        )}
      </div>

      {/* BMI Information */}
      <div
        className="mx-auto mt-5"
        style={{
          maxWidth: "775px",
          background: "#ffffff",
          borderRadius: "20px",
          padding: "30px 38px",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.05)",
        }}
      >
        <h3
          style={{
            fontSize: "21px",
            fontWeight: "700",
            marginBottom: "20px",
            color: "#20252b",
          }}
        >
          BMI Categories
        </h3>

        <div className="row g-3">
          <div className="col-6 col-md-3">
            <div
              style={{
                padding: "15px",
                borderRadius: "12px",
                background: "#e8f7fb",
                textAlign: "center",
              }}
            >
              <strong className="text-info">Underweight</strong>
              <div style={{ color: "#777", fontSize: "14px", marginTop: "4px" }}>
                Below 18.5
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div
              style={{
                padding: "15px",
                borderRadius: "12px",
                background: "#e8f7ef",
                textAlign: "center",
              }}
            >
              <strong className="text-success">Normal</strong>
              <div style={{ color: "#777", fontSize: "14px", marginTop: "4px" }}>
                18.5 – 24.9
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div
              style={{
                padding: "15px",
                borderRadius: "12px",
                background: "#fff7df",
                textAlign: "center",
              }}
            >
              <strong className="text-warning">Overweight</strong>
              <div style={{ color: "#777", fontSize: "14px", marginTop: "4px" }}>
                25 – 29.9
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div
              style={{
                padding: "15px",
                borderRadius: "12px",
                background: "#fdeaea",
                textAlign: "center",
              }}
            >
              <strong className="text-danger">Obese</strong>
              <div style={{ color: "#777", fontSize: "14px", marginTop: "4px" }}>
                30+
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BMI;