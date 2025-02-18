import React, { useEffect } from "react";
import { RotatingSquare } from "react-loader-spinner";

const Loading = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.reload(); // This will refresh the page
    }, 10000); // 3000ms = 3 seconds

    return () => clearTimeout(timer); // Cleanup the timer on component unmount
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <RotatingSquare
        visible={true}
        height="100"
        width="100"
        color="#40e0d0" // Adjusted to a water-like teal shade
        ariaLabel="rotating-square-loading"
        wrapperStyle={{}}
        wrapperClass=""
      />
    </div>
  );
};

export default Loading;
