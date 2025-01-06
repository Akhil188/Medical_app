"use client";
import React from "react";

const ErrorBoundary = ({
  error,
  children,
}: {
  error: Error;
  children: React.ReactNode;
}) => {
  return (
    <>
      <div>{error.message}</div>
      <div>{children}</div>
    </>
  );
};

export default ErrorBoundary;
