





"use client"

import { useForm } from "@tanstack/react-form"

import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

import { Input } from "@/components/ui/input"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Checkbox } from "@/components/ui/checkbox"

import type { TempleFormData } from "../templeTypes"
import { templeSchema } from "../templeValidation"

interface TempleFormProps {
  initialData?: Partial<TempleFormData>
  loading?: boolean
  onSubmit: (data: TempleFormData) => Promise<void> | void
  onCancel: () => void
}

// const defaultValues: TempleFormData = {
//   temp_name: "",
//   temp_img_name: "",
//   temp_legal_name: "",
//   temp_registration_number: "",
//   temp_gst_number: "",
//   temp_email: "",
//   temp_phone: "",

//   temp_address_line1: "",
//   temp_address_line2: "",
//   temp_city: "",
//   temp_state: "",
//   temp_country: "India",
//   temp_pincode: "",

//   temp_lat: null,
//   temp_lng: null,

//   temp_is_primary: false,
//   temp_status: "active",
//   temp_timezone: "Asia/Kolkata",
// }
const defaultValues: TempleFormData = {
  temp_name: "",
  temp_img_name: "",
  temp_legal_name: "",
  temp_registration_number: "",
  temp_gst_number: "",
  temp_email: "",
  temp_phone: "",
  temp_address_line1: "",
  temp_address_line2: "",
  temp_city: "",
  temp_state: "",
  temp_country: "India",
  temp_pincode: "",
  temp_lat: null,
  temp_lng: null,
  temp_is_primary: false,
  temp_status: "active",
  temp_timezone: "Asia/Kolkata",
};

export default function TempleForm({
  initialData,
  loading = false,
  onSubmit,
  onCancel,
}: TempleFormProps) {
  
 
  const form = useForm({
  defaultValues: {
    ...defaultValues,
    ...initialData,
  },

  validators: {
    onSubmit: templeSchema,
  },

  // onSubmit: async ({ value }) => {
  //   console.log("================================")
  //   console.log("TEMPLE FORM SUBMIT")
  //   console.log("================================")

  //   console.log("FORM VALUE:", value)

  //   const submitData: TempleFormData = {
  //     temp_name: value.temp_name.trim(),

  //     temp_img_name:
  //       value.temp_img_name?.trim() ?? "",

  //     temp_legal_name:
  //       value.temp_legal_name?.trim() ?? "",

  //     temp_registration_number:
  //       value.temp_registration_number?.trim() ?? "",

  //     temp_gst_number:
  //       value.temp_gst_number?.trim() ?? "",

  //     temp_email:
  //       value.temp_email?.trim() ?? "",

  //     temp_phone:
  //       value.temp_phone?.trim() ?? "",

  //     temp_address_line1:
  //       value.temp_address_line1.trim(),

  //     temp_address_line2:
  //       value.temp_address_line2?.trim() ?? "",

  //     temp_city:
  //       value.temp_city.trim(),

  //     temp_state:
  //       value.temp_state.trim(),

  //     temp_country:
  //       value.temp_country.trim(),

  //     temp_pincode:
  //       value.temp_pincode.trim(),

  //     temp_lat:
  //       value.temp_lat !== null &&
  //       value.temp_lat !== undefined
  //         ? Number(value.temp_lat)
  //         : null,

  //     temp_lng:
  //       value.temp_lng !== null &&
  //       value.temp_lng !== undefined
  //         ? Number(value.temp_lng)
  //         : null,

  //     temp_is_primary:
  //       Boolean(value.temp_is_primary),

  //     temp_status:
  //       value.temp_status,

  //     temp_timezone:
  //       value.temp_timezone,
  //   }

  //   console.log("FINAL TEMPLE DATA:")
  //   console.log(submitData)

  //   console.log(
  //     "FINAL TEMPLE JSON:",
  //     JSON.stringify(submitData, null, 2),
  //   )

  //   await onSubmit(submitData)
  // },

  onSubmit: async ({ value }) => {
  const submitData: TempleFormData = {
    ...value,
    temp_name: value.temp_name.trim(),
    temp_img_name: value.temp_img_name.trim(),
    temp_legal_name: value.temp_legal_name.trim(),
    temp_registration_number: value.temp_registration_number.trim(),
    temp_gst_number: value.temp_gst_number.trim().toUpperCase(),
    temp_email: value.temp_email.trim(),
    temp_phone: value.temp_phone.trim(),
    temp_address_line1: value.temp_address_line1.trim(),
    temp_address_line2: value.temp_address_line2.trim(),
    temp_city: value.temp_city.trim(),
    temp_state: value.temp_state.trim(),
    temp_country: value.temp_country.trim(),
    temp_pincode: value.temp_pincode.trim(),
  };

  await onSubmit(submitData);
},

  onSubmitInvalid: ({ formApi }) => {
    console.error(
      "================================",
    )

    console.error(
      "TEMPLE FORM VALIDATION FAILED",
    )

    console.error(
      "FORM VALUES:",
      formApi.state.values,
    )

    console.error(
      "FORM ERRORS:",
      formApi.state.errors,
    )

    console.error(
      "================================",
    )
  },
})

  const getErrorText = (
    errors: unknown[],
  ): string => {
    return errors
      .map((error) => {
        if (typeof error === "string") {
          return error
        }

        if (
          error &&
          typeof error === "object" &&
          "message" in error
        ) {
          return String(
            (
              error as {
                message?: unknown
              }
            ).message ?? "",
          )
        }

        return ""
      })
      .filter(Boolean)
      .join(", ")
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()

        // void form.handleSubmit()
         console.log("========== FORM BUTTON CLICKED ==========")
    console.log("FORM VALUES:", form.state.values)

    void form.handleSubmit()
      .then(() => {
        console.log("========== FORM HANDLE SUBMIT FINISHED ==========")
      })
      .catch((error) => {
        console.error("========== FORM HANDLE SUBMIT ERROR ==========")
        console.error(error)
      })
      }}
      className="space-y-6"
    >
      {/* ============================================================
          TEMPLE DETAILS
      ============================================================ */}

      <Card>
        <CardHeader>
          <CardTitle>
            {initialData
              ? "Edit Temple"
              : "Add Temple"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

            {/* TEMPLE NAME */}

            <form.Field
              name="temp_name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>
                      Temple Name
                      <span className="text-destructive">
                        {" "}*
                      </span>
                    </FieldLabel>

                    <Input
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(
                          event.target.value,
                        )
                      }
                      onBlur={field.handleBlur}
                      placeholder="Enter temple name"
                      disabled={loading}
                      aria-invalid={isInvalid}
                    />

                    <FieldDescription>
                      Official name of the temple.
                    </FieldDescription>

                    {isInvalid && (
                      <FieldError>
                        {getErrorText(
                          field.state.meta.errors,
                        )}
                      </FieldError>
                    )}
                  </Field>
                )
              }}
            />

            {/* LEGAL NAME */}

            <form.Field
              name="temp_legal_name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>
                      Legal Name
                      
                    </FieldLabel>

                    <Input
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(
                          event.target.value,
                        )
                      }
                      onBlur={field.handleBlur}
                      placeholder="Enter legal name"
                      disabled={loading}
                      aria-invalid={isInvalid}
                    />

                    {isInvalid && (
                      <FieldError>
                        {getErrorText(
                          field.state.meta.errors,
                        )}
                      </FieldError>
                    )}
                  </Field>
                )
              }}
            />

            {/* REGISTRATION NUMBER */}

            <form.Field
              name="temp_registration_number"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>
                      Registration Number
                    </FieldLabel>

                    <Input
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(
                          event.target.value,
                        )
                      }
                      onBlur={field.handleBlur}
                      placeholder="TRU-001"
                      disabled={loading}
                      aria-invalid={isInvalid}
                    />

                    {isInvalid && (
                      <FieldError>
                        {getErrorText(
                          field.state.meta.errors,
                        )}
                      </FieldError>
                    )}
                  </Field>
                )
              }}
            />

            {/* GST */}

            <form.Field
              name="temp_gst_number"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>
                      GST Number
                    </FieldLabel>

                    <Input
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(
                          event.target.value,
                        )
                      }
                      onBlur={field.handleBlur}
                      placeholder="Enter GST number"
                      disabled={loading}
                      aria-invalid={isInvalid}
                    />

                    {isInvalid && (
                      <FieldError>
                        {getErrorText(
                          field.state.meta.errors,
                        )}
                      </FieldError>
                    )}
                  </Field>
                )
              }}
            />

            {/* IMAGE */}

            <form.Field
              name="temp_img_name"
              children={(field) => (
                <Field>
                  <FieldLabel>
                    Image Name
                  </FieldLabel>

                  <Input
                    value={field.state.value}
                    onChange={(event) =>
                      field.handleChange(
                        event.target.value,
                      )
                    }
                    onBlur={field.handleBlur}
                    placeholder="ganesh.jpg"
                    disabled={loading}
                  />

                  <FieldDescription>
                    Store the uploaded image filename.
                  </FieldDescription>
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      {/* ============================================================
          CONTACT INFORMATION
      ============================================================ */}

      <Card>
        <CardHeader>
          <CardTitle>
            Contact Information
          </CardTitle>
        </CardHeader>

        <CardContent>
          <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

            {/* EMAIL */}

            <form.Field
              name="temp_email"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>
                      Email
                        <span className="text-destructive">
                        {" "}*
                      </span>
                    </FieldLabel>

                    <Input
                      type="email"
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(
                          event.target.value,
                        )
                      }
                      onBlur={field.handleBlur}
                      placeholder="temple@example.com"
                      disabled={loading}
                      aria-invalid={isInvalid}
                    />

                    {isInvalid && (
                      <FieldError>
                        {getErrorText(
                          field.state.meta.errors,
                        )}
                      </FieldError>
                    )}
                  </Field>
                )
              }}
            />

            {/* PHONE */}

            <form.Field
              name="temp_phone"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>
                      Phone
                        <span className="text-destructive">
                        {" "}*
                      </span>
                    </FieldLabel>

                    <Input
                      type="tel"
                      maxLength={10}
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(
                          event.target.value.replace(
                            /\D/g,
                            "",
                          ),
                        )
                      }
                      onBlur={field.handleBlur}
                      placeholder="9876543210"
                      disabled={loading}
                      aria-invalid={isInvalid}
                    />

                    {isInvalid && (
                      <FieldError>
                        {getErrorText(
                          field.state.meta.errors,
                        )}
                      </FieldError>
                    )}
                  </Field>
                )
              }}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      {/* ============================================================
          ADDRESS
      ============================================================ */}

      <Card>
        <CardHeader>
          <CardTitle>
            Address
          </CardTitle>
        </CardHeader>

        <CardContent>
          <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

            {/* ADDRESS LINE 1 */}

            <form.Field
              name="temp_address_line1"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>
                      Address Line 1
                    
                    </FieldLabel>

                    <Input
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(
                          event.target.value,
                        )
                      }
                      onBlur={field.handleBlur}
                      placeholder="MG Road"
                      disabled={loading}
                      aria-invalid={isInvalid}
                    />

                    {isInvalid && (
                      <FieldError>
                        {getErrorText(
                          field.state.meta.errors,
                        )}
                      </FieldError>
                    )}
                  </Field>
                )
              }}
            />

            {/* ADDRESS LINE 2 */}

            <form.Field
              name="temp_address_line2"
              children={(field) => (
                <Field>
                  <FieldLabel>
                    Address Line 2
                  </FieldLabel>

                  <Input
                    value={field.state.value}
                    onChange={(event) =>
                      field.handleChange(
                        event.target.value,
                      )
                    }
                    onBlur={field.handleBlur}
                    placeholder="Near Circle"
                    disabled={loading}
                  />
                </Field>
              )}
            />

            {/* CITY */}

            <form.Field
              name="temp_city"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>
                      City
                    
                    </FieldLabel>

                    <Input
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(
                          event.target.value,
                        )
                      }
                      onBlur={field.handleBlur}
                      placeholder="Bengaluru"
                      disabled={loading}
                      aria-invalid={isInvalid}
                    />

                    {isInvalid && (
                      <FieldError>
                        {getErrorText(
                          field.state.meta.errors,
                        )}
                      </FieldError>
                    )}
                  </Field>
                )
              }}
            />

            {/* STATE */}

            <form.Field
              name="temp_state"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>
                      State
                      
                    </FieldLabel>

                    <Input
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(
                          event.target.value,
                        )
                      }
                      onBlur={field.handleBlur}
                      placeholder="Karnataka"
                      disabled={loading}
                      aria-invalid={isInvalid}
                    />

                    {isInvalid && (
                      <FieldError>
                        {getErrorText(
                          field.state.meta.errors,
                        )}
                      </FieldError>
                    )}
                  </Field>
                )
              }}
            />

            {/* COUNTRY */}

            <form.Field
              name="temp_country"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>
                      Country
                     
                    </FieldLabel>

                    <Input
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(
                          event.target.value,
                        )
                      }
                      onBlur={field.handleBlur}
                      placeholder="India"
                      disabled={loading}
                      aria-invalid={isInvalid}
                    />

                    {isInvalid && (
                      <FieldError>
                        {getErrorText(
                          field.state.meta.errors,
                        )}
                      </FieldError>
                    )}
                  </Field>
                )
              }}
            />

            {/* PINCODE */}

            <form.Field
              name="temp_pincode"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>
                      Pincode
                      
                    </FieldLabel>

                    <Input
                      maxLength={6}
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(
                          event.target.value.replace(
                            /\D/g,
                            "",
                          ),
                        )
                      }
                      onBlur={field.handleBlur}
                      placeholder="560001"
                      disabled={loading}
                      aria-invalid={isInvalid}
                    />

                    {isInvalid && (
                      <FieldError>
                        {getErrorText(
                          field.state.meta.errors,
                        )}
                      </FieldError>
                    )}
                  </Field>
                )
              }}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      {/* ============================================================
          LOCATION
      ============================================================ */}

      <Card>
        <CardHeader>
          <CardTitle>
            Location
          </CardTitle>
        </CardHeader>

        <CardContent>
          <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

            {/* LATITUDE */}

            <form.Field
              name="temp_lat"
              children={(field) => (
                <Field>
                  <FieldLabel>
                    Latitude
                  </FieldLabel>

                  <Input
                    type="number"
                    step="any"
                    value={
                      field.state.value ?? ""
                    }
                    onChange={(event) => {
                      const value =
                        event.target.value

                      field.handleChange(
                        value === ""
                          ? null
                          : Number(value),
                      )
                    }}
                    onBlur={field.handleBlur}
                    placeholder="12.971598"
                    disabled={loading}
                  />

                  <FieldDescription>
                    Example: 12.971598
                  </FieldDescription>
                </Field>
              )}
            />

            {/* LONGITUDE */}

            <form.Field
              name="temp_lng"
              children={(field) => (
                <Field>
                  <FieldLabel>
                    Longitude
                  </FieldLabel>

                  <Input
                    type="number"
                    step="any"
                    value={
                      field.state.value ?? ""
                    }
                    onChange={(event) => {
                      const value =
                        event.target.value

                      field.handleChange(
                        value === ""
                          ? null
                          : Number(value),
                      )
                    }}
                    onBlur={field.handleBlur}
                    placeholder="77.594566"
                    disabled={loading}
                  />

                  <FieldDescription>
                    Example: 77.594566
                  </FieldDescription>
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      {/* ============================================================
          TEMPLE SETTINGS
      ============================================================ */}

      <Card>
        <CardHeader>
          <CardTitle>
            Temple Settings
          </CardTitle>
        </CardHeader>

        <CardContent>
          <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

            {/* STATUS */}

            <form.Field
              name="temp_status"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>
                      Status
                    </FieldLabel>

                    <Select
                      value={field.state.value}
                      onValueChange={(value) => {
                        if (value !== null) {
                          field.handleChange(
                            value as TempleFormData["temp_status"],
                          )

                          field.handleBlur()
                        }
                      }}
                      disabled={loading}
                    >
                      <SelectTrigger
                        aria-invalid={isInvalid}
                      >
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="active">
                          Active
                        </SelectItem>

                        <SelectItem value="inactive">
                          Inactive
                        </SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>

                    {isInvalid && (
                      <FieldError>
                        {getErrorText(
                          field.state.meta.errors,
                        )}
                      </FieldError>
                    )}
                  </Field>
                )
              }}
            />

            {/* TIMEZONE */}

            <form.Field
              name="temp_timezone"
              children={(field) => (
                <Field>
                  <FieldLabel>
                    Timezone
                  </FieldLabel>

                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                      if (value !== null) {
                        field.handleChange(value)
                        field.handleBlur()
                      }
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">
                        Asia/Kolkata
                      </SelectItem>

                      <SelectItem value="UTC">
                        UTC
                      </SelectItem>

                      <SelectItem value="Asia/Dubai">
                        Asia/Dubai
                      </SelectItem>

                      <SelectItem value="Asia/Singapore">
                        Asia/Singapore
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            {/* PRIMARY TEMPLE */}

            <form.Field
              name="temp_is_primary"
              children={(field) => (
                <Field>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={field.state.value}
                      onCheckedChange={(checked) => {
                        field.handleChange(
                          checked === true,
                        )

                        field.handleBlur()
                      }}
                      disabled={loading}
                    />

                    <div>
                      <FieldLabel>
                        Primary Temple
                      </FieldLabel>

                      <FieldDescription>
                        Mark this temple as the
                        organization's primary
                        temple.
                      </FieldDescription>
                    </div>
                  </div>
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      {/* ============================================================
          BUTTONS
      ============================================================ */}

      <div className="flex justify-end gap-3">
        <Button
          className="cursor-pointer"
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
          className="cursor-pointer"
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : initialData
              ? "Update Temple"
              : "Create Temple"}
        </Button>
      </div>
    </form>
  )
}