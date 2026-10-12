import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import {Card,CardContent,CardFooter,CardHeader,CardTitle,} from "@/components/ui/card";
import {Field,FieldDescription,FieldError,FieldGroup,FieldLabel,} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from "@/components/ui/select";
import type { Temple } from "../../temple/templeTypes";
import type { Deity } from "../deityTypes";
import { ImagePlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  deitySchema,
  type DeityFormData,
} from "../deityValidation";

interface DeityFormProps {
  initialData?: Partial<Deity> | null;
  loading?: boolean;
  temples: Temple[];
  templesLoading?: boolean;
  onSubmit: (data: DeityFormData) => Promise<void> | void;
  onCancel?: () => void;
}

export default function DeitiesForm({
  initialData,
  loading = false,
  temples,
  templesLoading = false,
  onSubmit,
  onCancel,
}: DeityFormProps) {
  const isEditMode = Boolean(initialData);

  const form = useForm({
    defaultValues: {
      temple_id: initialData?.temple_id ?? 0,
      deity_name: initialData?.deity_name ?? "",
      // deity_code: initialData?.deity_code ?? "",
      deity_img_name: initialData?.deity_img_name ?? "",
      deity_description: initialData?.deity_description ?? "",
      deity_is_default: initialData?.deity_is_default ?? "no",
      deity_display_order: initialData?.deity_display_order ?? 1,
      deity_status: initialData?.deity_status ?? "active",
    } satisfies DeityFormData,

    validators: {
      onSubmit: deitySchema,
    },

    onSubmit: async ({ value }) => {
      await onSubmit({
        ...value,
        deity_name: value.deity_name.trim(),
        // deity_code: value.deity_code.trim(),
        deity_img_name: value.deity_img_name.trim(),
        deity_description: value.deity_description.trim(),
      });
    },
  });
const [imagePreview, setImagePreview] = useState<string | null>(null);
const [selectedImage, setSelectedImage] = useState<File | null>(null);

useEffect(() => {
  return () => {
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
  };
}, [imagePreview]);
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle> {isEditMode ? "Edit Deity" : "Create Deity"} </CardTitle>
      </CardHeader>

      <CardContent>
        <form
          id="deity-form"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
          noValidate
        >
          <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Temple */}
            {/* <form.Field
              name="temple_id"
              children={(field) => {
                const invalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid;

                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Temple *
                    </FieldLabel>

                    <Select
                      value={
                        field.state.value > 0
                          ? String(field.state.value)
                          : ""
                      }
                      onValueChange={(value) => {
                        field.handleChange(Number(value));
                        field.handleBlur();
                      }}
                      disabled={
                        loading ||
                        templesLoading ||
                        temples.length === 0
                      }
                    >
                      <SelectTrigger
                        id={field.name}
                        className="w-full"
                        aria-invalid={invalid}
                      >
                        <SelectValue
                          placeholder={
                            templesLoading
                              ? "Loading temples..."
                              : temples.length === 0
                                ? "No temples available"
                                : "Select a temple"
                          }
                        />
                      </SelectTrigger>

                      <SelectContent>
                        {temples.map((temple) => (
                          <SelectItem
                            key={temple.id}
                            value={String(temple.id)}
                          >
                            {temple.temp_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FieldDescription>
                      Select the temple this deity belongs to.
                    </FieldDescription>

                    {invalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            /> */}
            
          <form.Field
            name="temple_id"
            children={(field) => {
              const invalid =
                field.state.meta.isTouched &&
                !field.state.meta.isValid;

              const selectedTemple = temples.find(
                (temple) => temple.id === Number(field.state.value)
              );

              return (
                <Field data-invalid={invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Temple *
                  </FieldLabel>

                  <Select
                    value={
                      field.state.value > 0
                        ? String(field.state.value)
                        : ""
                    }
                    onValueChange={(value) => {
                      field.handleChange(Number(value));
                      field.handleBlur();
                    }}
                    disabled={
                      loading ||
                      templesLoading ||
                      temples.length === 0
                    }
                  >
                    <SelectTrigger
                      id={field.name}
                      className="w-full capitalize cursor-pointer"
                      
                      aria-invalid={invalid}
                    >
                      <SelectValue
                        placeholder={
                          templesLoading
                            ? "Loading temples..."
                            : temples.length === 0
                              ? "No temples available"
                              : "Select a temple"
                        }
                      >
                        {selectedTemple?.temp_name}
                      </SelectValue>
                    </SelectTrigger>

                    <SelectContent>
                      {temples.map((temple) => (
                        <SelectItem
                          key={temple.id}
                          value={String(temple.id)}
                        >
                          {temple.temp_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FieldDescription>
                    Select the temple this deity belongs to.
                  </FieldDescription>

                  {invalid && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              );
            }}
          />

            {/* Deity name */}
            <form.Field
              name="deity_name"
              children={(field) => {
                const invalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid;

                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Deity Name *
                    </FieldLabel>

                    <Input
                      id={field.name}
                      value={field.state.value}
                      placeholder="e.g. Lord Ganesha"
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={invalid}
                      disabled={loading}
                    />

                    {invalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            {/* Deity code */}
            {/* <form.Field
              name="deity_code"
              children={(field) => {
                const invalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid;

                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Deity Code *
                    </FieldLabel>

                    <Input
                      id={field.name}
                      value={field.state.value}
                      placeholder="e.g. GANESHA"
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={invalid}
                      disabled={loading}
                    />

                    <FieldDescription>
                      Must be unique within the selected temple.
                    </FieldDescription>

                    {invalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            /> */}

            
            {/* Deity Image */}
            <form.Field
              name="deity_img_name"
              children={(field) => (
                <Field className="lg:col-span-1">
                  <FieldLabel htmlFor="deity-image-upload">
                    Deity Image 
                  </FieldLabel>

                  <div className="space-y-3">
                    <label
                      htmlFor="deity-image-upload"
                      className="flex min-h-10 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-4 transition hover:border-primary hover:bg-muted/40"
                    >
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Deity preview"
                          className="h-36 w-36 rounded-lg object-cover"
                        />
                      ) : (
                        <>
                          <ImagePlus className="mb-2 size-10 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            Click to upload deity image
                          </span>
                          <span className="mt-1 text-xs text-muted-foreground">
                            PNG, JPG or WEBP
                          </span>
                        </>
                      )}

                      <input
                        id="deity-image-upload"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        disabled={loading}
                        onChange={(event) => {
                          const file = event.target.files?.[0];

                          if (!file) return;

                          if (
                            !["image/png", "image/jpeg", "image/webp"].includes(
                              file.type
                            )
                          ) {
                            event.target.value = "";
                            return;
                          }

                          if (file.size > 5 * 1024 * 1024) {
                            event.target.value = "";
                            return;
                          }

                          setSelectedImage(file);
                          setImagePreview((previous) => {
                            if (previous?.startsWith("blob:")) {
                              URL.revokeObjectURL(previous);
                            }

                            return URL.createObjectURL(file);
                          });

                          field.handleChange(file.name);
                          field.handleBlur();
                        }}
                      />
                    </label>

                    {selectedImage && (
                      <div className="flex items-center justify-between rounded-md border p-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {selectedImage.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(selectedImage.size / 1024).toFixed(1)} KB
                          </p>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={loading}
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview((previous) => {
                              if (previous?.startsWith("blob:")) {
                                URL.revokeObjectURL(previous);
                              }
                              return null;
                            });

                            field.handleChange("");
                            const input = document.getElementById(
                              "deity-image-upload"
                            ) as HTMLInputElement | null;

                            if (input) input.value = "";
                          }}
                        >
                          <X className="size-4" />
                          <span className="sr-only">Remove image</span>
                        </Button>
                      </div>
                    )}

                    <FieldDescription>
                      Optional. PNG, JPG or WEBP, maximum 5 MB.
                    </FieldDescription>
                  </div>
                </Field>
              )}
            />

            {/* Default deity */}
            <form.Field
              name="deity_is_default"
              children={(field) => (
                <Field>
                  <FieldLabel>Default Deity *</FieldLabel>

                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                      field.handleChange(value as "yes" | "no");
                      field.handleBlur();
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full capitalize cursor-pointer">
                      <SelectValue placeholder="Select default" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>

                  <FieldDescription>
                    Choose whether this is the temple's default deity.
                  </FieldDescription>
                </Field>
              )}
            />

            {/* Display order */}
            <form.Field
              name="deity_display_order"
              children={(field) => {
                const invalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid;

                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Display Order *
                    </FieldLabel>

                    <Input
                      id={field.name}
                      type="number"
                      min={0}
                      max={65535}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(
                          event.target.value === ""
                            ? 0
                            : Number(event.target.value),
                        )
                      }
                      aria-invalid={invalid}
                      disabled={loading}
                    />

                    {invalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            {/* Status */}
            <form.Field
              name="deity_status"
              children={(field) => (
                <Field>
                  <FieldLabel>Status *</FieldLabel>

                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                      field.handleChange(
                        value as "active" | "inactive",
                      );
                      field.handleBlur();
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full capitalize cursor-pointer">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            {/* Description */}
            <form.Field
              name="deity_description"
              children={(field) => {
                const invalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid;

                return (
                  <Field
                    className="md:col-span-2 lg:col-span-3"
                    data-invalid={invalid}
                  >
                    <FieldLabel htmlFor={field.name}>
                      Description
                    </FieldLabel>

                    <Textarea
                      id={field.name}
                      value={field.state.value}
                      placeholder="Enter deity details or description"
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={invalid}
                      disabled={loading}
                    />

                    <FieldDescription>
                      Optional; maximum 5000 characters.
                    </FieldDescription>

                    {invalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="flex justify-end gap-2 ">
        <Button
        className="cursor-pointer"
          type="button"
          variant="outline"
          onClick={() => {
            if (onCancel) {
              onCancel();
            } else {
              form.reset();
            }
          }}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
        className="cursor-pointer"
          type="submit"
          form="deity-form"
          disabled={loading || templesLoading || temples.length === 0}
        >
          {loading
            ? "Saving..."
            : isEditMode
              ? "Update Deity"
              : "Create Deity"}
        </Button>
      </CardFooter>
    </Card>
  );
}