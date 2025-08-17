import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import tripSchema, { TripFormData } from './schemas/tripSchema';
import FormSelector from '../forms/FormSelector';

type Props = {
  defaultValues?: Partial<TripFormData>;
  // accept any here to avoid strict resolver/type mismatch; validation still occurs via yup
  onSubmit: (data: any) => Promise<void> | void;
};

const TripForm: React.FC<Props> = ({ defaultValues = {}, onSubmit }) => {
  const {
  register,
  handleSubmit,
  setValue,
  formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: yupResolver(tripSchema),
    defaultValues: defaultValues as any,
    mode: 'onSubmit',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Driver</label>
        <FormSelector
          name="driverId"
          label="Driver"
          collection="drivers"
          labelField="name"
          valueField="id"
          required
          value={(defaultValues.driverId as string) || ''}
          onChange={(v: string) => {
            setValue('driverId', v);
          }}
        />
        {errors.driverId?.message && (
          <p className="text-sm text-red-600">{String(errors.driverId?.message)}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Vehicle</label>
        <FormSelector
          name="vehicleId"
          label="Vehicle"
          collection="fleet"
          labelField="registrationNumber"
          valueField="id"
          required
          value={(defaultValues.vehicleId as string) || ''}
          onChange={(v: string) => {
            setValue('vehicleId', v);
          }}
        />
        {errors.vehicleId?.message && (
          <p className="text-sm text-red-600">{String(errors.vehicleId?.message)}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Start Date</label>
        <input type="date" {...register('startDate' as any)} className="mt-1 block w-full" />
        {errors.startDate?.message && (
          <p className="text-sm text-red-600">{String(errors.startDate?.message)}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">End Date</label>
        <input type="date" {...register('endDate' as any)} className="mt-1 block w-full" />
        {errors.endDate?.message && (
          <p className="text-sm text-red-600">{String(errors.endDate?.message)}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea {...register('notes' as any)} className="mt-1 block w-full" rows={4} />
        {errors.notes?.message && (
          <p className="text-sm text-red-600">{String(errors.notes?.message)}</p>
        )}
      </div>

      <div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
};

export default TripForm;
