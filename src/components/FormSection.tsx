import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface FormSectionProps {
  onFileUpload: (headers: string[], data: string[][]) => void;
  districtName: string;
  setDistrictName: (value: string) => void;
  mandalName: string;
  setMandalName: (value: string) => void;
  villageName: string;
  setVillageName: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  startTime: string;
  setStartTime: (value: string) => void;
  notificationNumber: string;
  setNotificationNumber: (value: string) => void;
}

const FormSection: React.FC<FormSectionProps> = ({
  onFileUpload,
  districtName,
  setDistrictName,
  mandalName,
  setMandalName,
  villageName,
  setVillageName,
  startDate,
  setStartDate,
  startTime,
  setStartTime,
  notificationNumber,
  setNotificationNumber,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    processCSVFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file || !file.name.endsWith(".csv")) return;

    setFileName(file.name);
    processCSVFile(file);
  };

  const processCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const rows = content
        .split("\n")
        .map((row) => row.split(",").map((cell) => cell.trim()));

      if (rows.length > 1) {
        const headers = rows[0];
        const data = rows
          .slice(1)
          .filter((row) => row.some((cell) => cell.trim() !== ""));
        onFileUpload(headers, data);
      }
    };
    reader.readAsText(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="no-print"
    >
      <Card className="overflow-hidden glass-panel">
        <CardContent className="pt-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-medium">Location Details</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="districtName">District Name</Label>
                <Input
                  id="districtName"
                  placeholder="Enter district name"
                  className="form-input"
                  value={districtName}
                  onChange={(e) => setDistrictName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mandalName">Mandal Name</Label>
                <Input
                  id="mandalName"
                  placeholder="Enter mandal name"
                  className="form-input"
                  value={mandalName}
                  onChange={(e) => setMandalName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="villageName">Village Name</Label>
                <Input
                  id="villageName"
                  placeholder="Enter village name"
                  className="form-input"
                  value={villageName}
                  onChange={(e) => setVillageName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  className="form-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  className="form-input"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notficationNumber">Notification Number</Label>
                <Input
                  id="notificationNumber"
                  placeholder="Enter 6(1) Notification Number"
                  className="form-input"
                  value={notificationNumber}
                  onChange={(e) => setNotificationNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4">
              <h2 className="text-2xl font-medium mb-4">Upload CSV File</h2>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-gray-300 hover:border-primary/50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      {fileName
                        ? `Selected file: ${fileName}`
                        : "Drag and drop your CSV file here, or click to browse"}
                    </p>
                  </div>
                  <input
                    type="file"
                    id="csvFile"
                    className="hidden"
                    accept=".csv"
                    onChange={handleFileChange}
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("csvFile")?.click()}
                    className="mt-2"
                  >
                    Browse Files
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FormSection;
