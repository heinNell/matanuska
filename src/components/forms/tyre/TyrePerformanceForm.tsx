import { Box, Button, Paper, Slider, Stack, TextField, Typography } from "@mui/material";
import React, { useState } from "react";

interface TyrePerformanceData {
  brand: string;
  model: string;
  size: string;
  dryGrip: number;
  wetGrip: number;
  rollingResistance: number;
  noiseLevel: number;
}

const TyrePerformanceForm = () => {
  const [formData, setFormData] = useState<TyrePerformanceData>({
    brand: "",
    model: "",
    size: "",
    dryGrip: 5,
    wetGrip: 5,
    rollingResistance: 5,
    noiseLevel: 5,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSliderChange =
    (name: keyof TyrePerformanceData) => (_event: Event, newValue: number | number[]) => {
      setFormData({
        ...formData,
        [name]: newValue as number,
      });
    };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Form Data:", formData);
    // Add your form submission logic here
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 500, mx: "auto", mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Tyre Performance Evaluation
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Tyre Brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            required
          />

          <TextField
            fullWidth
            label="Tyre Model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
          />

          <TextField
            fullWidth
            label="Tyre Size"
            name="size"
            value={formData.size}
            onChange={handleChange}
            required
          />

          <Box>
            <Typography gutterBottom>Dry Grip</Typography>
            <Slider
              value={formData.dryGrip}
              onChange={handleSliderChange("dryGrip")}
              min={1}
              max={10}
              step={1}
              marks
              valueLabelDisplay="auto"
            />
          </Box>

          <Box>
            <Typography gutterBottom>Wet Grip</Typography>
            <Slider
              value={formData.wetGrip}
              onChange={handleSliderChange("wetGrip")}
              min={1}
              max={10}
              step={1}
              marks
              valueLabelDisplay="auto"
            />
          </Box>

          <Box>
            <Typography gutterBottom>Rolling Resistance</Typography>
            <Slider
              value={formData.rollingResistance}
              onChange={handleSliderChange("rollingResistance")}
              min={1}
              max={10}
              step={1}
              marks
              valueLabelDisplay="auto"
            />
          </Box>

          <Box>
            <Typography gutterBottom>Noise Level</Typography>
            <Slider
              value={formData.noiseLevel}
              onChange={handleSliderChange("noiseLevel")}
              min={1}
              max={10}
              step={1}
              marks
              valueLabelDisplay="auto"
            />
          </Box>

          <Button type="submit" variant="contained" color="primary" fullWidth size="large">
            Submit
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

export default TyrePerformanceForm;
