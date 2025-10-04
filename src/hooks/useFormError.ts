import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import {
  ApiError,
  getErrorMessage,
  getErrorTitle,
} from "@/utils/errors/apiErrors";

export const useFormError = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleFormError = (error: any, form?: UseFormReturn<any>) => {
    if (ApiError.isApiError(error)) {
      // Handle field-specific validation errors
      if (error.code === "VALIDATION_ERROR" && error.details?.fields) {
        const fieldErrors = error.details.fields;

        Object.entries(fieldErrors).forEach(([field, message]) => {
          form?.setError(field as any, {
            type: "manual",
            message: message as string,
          });
        });

        setErrors(fieldErrors);

        toast({
          title: "Validation Error",
          description: "Please check the form for errors.",
          variant: "destructive",
        });
      } else {
        // General API error
        toast({
          title: getErrorTitle(error),
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    } else {
      // Unknown error
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const clearErrors = () => {
    setErrors({});
  };

  const setFieldError = (
    field: string,
    message: string,
    form?: UseFormReturn<any>,
  ) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
    form?.setError(field as any, { type: "manual", message });
  };

  return {
    errors,
    handleFormError,
    clearErrors,
    setFieldError,
  };
};
