import * as yup from 'yup';

export const tripSchema = yup.object({
  driverId: yup.string().required('Driver is required'),
  vehicleId: yup.string().required('Vehicle is required'),
  startDate: yup.date().required('Start date is required'),
  endDate: yup
    .date()
    .min(yup.ref('startDate'), 'End date cannot be before start date')
    .notRequired()
    .nullable(),
  notes: yup.string().max(1000, 'Notes are too long').nullable(),
});

export type TripFormData = yup.InferType<typeof tripSchema>;

export default tripSchema;
