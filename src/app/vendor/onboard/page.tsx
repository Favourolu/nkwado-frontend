"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileDropzone } from "@/components/vendor/FileDropzone";
import { onboardVendor } from "@/lib/vendor-api";
import { getErrorMessage } from "@/lib/get-error-message";
import { VENDOR_CATEGORY_LABELS, VendorCategory } from "@/lib/types";

const DOCUMENT_ACCEPT = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};

const vendorCategoryValues = Object.values(VendorCategory) as [string, ...string[]];

const onboardSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  category: z.enum(vendorCategoryValues, { error: "Select a category" }),
  description: z.string().optional(),
  location: z.string().optional(),
  phoneNumber: z.string().optional(),
  priceRange: z.string().optional(),
  services: z.string().optional(),
});

type OnboardFormValues = z.infer<typeof onboardSchema>;

export default function VendorOnboardPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OnboardFormValues>({
    resolver: zodResolver(onboardSchema),
  });

  const category = watch("category");

  const [cacDocument, setCacDocument] = useState<File[]>([]);
  const [supportingDocuments, setSupportingDocuments] = useState<File[]>([]);
  const [profilePhotos, setProfilePhotos] = useState<File[]>([]);

  const mutation = useMutation({
    mutationFn: onboardVendor,
    onSuccess: () => {
      toast.success("Onboarding submitted! Your account is under review.");
      router.push("/vendor/profile");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Couldn't submit onboarding. Please check your details."));
    },
  });

  const onSubmit = (values: OnboardFormValues) => {
    if (cacDocument.length === 0) {
      toast.error("Please upload your CAC document.");
      return;
    }
    mutation.mutate({
      businessName: values.businessName,
      category: values.category as VendorCategory,
      description: values.description || undefined,
      location: values.location || undefined,
      phoneNumber: values.phoneNumber || undefined,
      priceRange: values.priceRange || undefined,
      services: values.services
        ? values.services.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined,
      cacDocument: cacDocument[0],
      supportingDocuments,
      profilePhotos,
    });
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Complete your vendor onboarding</CardTitle>
          <CardDescription>
            Tell us about your business so we can get you verified.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="businessName">Business name</Label>
              <Input id="businessName" {...register("businessName")} />
              {errors.businessName && (
                <p className="text-sm text-destructive">{errors.businessName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(value) => setValue("category", value as VendorCategory)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(VENDOR_CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={3} {...register("description")} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Lagos" {...register("location")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone number</Label>
                <Input id="phoneNumber" {...register("phoneNumber")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceRange">Price range</Label>
              <Input
                id="priceRange"
                placeholder="₦50k - ₦200k per event"
                {...register("priceRange")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="services">Services (comma separated)</Label>
              <Input
                id="services"
                placeholder="Full catering, Bar service, Dessert station"
                {...register("services")}
              />
            </div>

            <FileDropzone
              label="CAC document"
              files={cacDocument}
              onChange={setCacDocument}
              multiple={false}
              accept={DOCUMENT_ACCEPT}
            />
            <FileDropzone
              label="Supporting documents"
              files={supportingDocuments}
              onChange={setSupportingDocuments}
              multiple
              accept={DOCUMENT_ACCEPT}
            />
            <FileDropzone
              label="Profile photos"
              files={profilePhotos}
              onChange={setProfilePhotos}
              multiple
              accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] }}
            />

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? "Submitting..." : "Submit for review"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
