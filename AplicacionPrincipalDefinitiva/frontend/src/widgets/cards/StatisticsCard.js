// src/widgets/cards/StatisticsCard.js
import React from "react";
import { Card, CardBody, CardHeader } from "@material-tailwind/react";

export const StatisticsCard = ({ title, icon, footer }) => {
  return (
    <Card className="shadow-md">
      <CardHeader className="p-4 bg-gradient-to-r from-blue-500 to-teal-400 text-white">
        {icon}
        <h5 className="text-lg">{title}</h5>
      </CardHeader>
      <CardBody className="p-4">{footer}</CardBody>
    </Card>
  );
};
