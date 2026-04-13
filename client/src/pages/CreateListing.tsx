import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { HyggloLayout } from "@/components/layout/HyggloLayout";
import { Camera, Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { createListing, uploadFiles } from "@/services/items";
import type { CreateListingInput } from "@shared/contracts";

const CATEGORIES = [
  "Tools & Equipment",
  "Electronics",
  "Cameras & Photography",
  "Sports & Outdoors",
  "Garden & DIY",
  "Party & Events",
  "Music & Instruments",
  "Home Appliances",
  "Vehicles & Transport",
  "Other",
];

export default function CreateListing() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CreateListingInput>({
    title: "",
    category: "",
    description: "",
    pricePerDay: 0,
    location: "London",
    images: [],
    features: [],
    insuranceEnabled: true,
    cancellationPolicy: "moderate",
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  const uploadMutation = useMutation({
    mutationFn: uploadFiles,
    onSuccess: (files) => {
      setFormData((prev) => ({ ...prev, images: files.map((f) => f.url) }));
      toast.success("Images uploaded successfully!");
    },
    onError: () => {
      toast.error("Failed to upload images");
    },
  });

  const createMutation = useMutation({
    mutationFn: createListing,
    onSuccess: () => {
      toast.success("Listing created successfully!");
      navigate("/dashboard?tab=listings");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create listing");
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (uploadedFiles.length + files.length > 8) {
      toast.error("Maximum 8 images allowed");
      return;
    }

    // Create preview URLs
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls((prev) => [...prev, ...previews]);
    setUploadedFiles((prev) => [...prev, ...files]);

    // Upload to server
    uploadMutation.mutate(files);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Please enter a description");
      return;
    }
    if (formData.pricePerDay <= 0) {
      toast.error("Please set a valid price");
      return;
    }
    if (formData.images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    createMutation.mutate(formData);
  };

  const canProceedToNext = () => {
    switch (step) {
      case 1:
        return formData.category !== "";
      case 2:
        return formData.title.trim() !== "" && formData.description.trim() !== "";
      case 3:
        return formData.images.length > 0;
      case 4:
        return formData.pricePerDay > 0;
      default:
        return false;
    }
  };

  return (
    <HyggloLayout>
      <div className="container py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-10 tracking-tight text-gray-900">
          List your item
        </h1>

        <div className="space-y-8">
          {/* Step 1: Category */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                step >= 1 ? "bg-pink-100 text-pink-500" : "bg-gray-100 text-gray-400"
              }`}>
                {step > 1 ? <Plus className="w-5 h-5" /> : "1"}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Select category</h3>
                <select
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white text-gray-700 outline-none focus:border-pink-300"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Step 2: Description */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                step >= 2 ? "bg-pink-100 text-pink-500" : "bg-gray-100 text-gray-400"
              }`}>
                {step > 2 ? <Plus className="w-5 h-5" /> : "2"}
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="text-xl font-bold text-gray-800">Describe your item</h3>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Professional DSLR Camera"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your item in detail..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-2 min-h-[120px]"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Step 3: Images */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                step >= 3 ? "bg-pink-100 text-pink-500" : "bg-gray-100 text-gray-400"
              }`}>
                {step > 3 ? <Plus className="w-5 h-5" /> : "3"}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 text-gray-800">Pictures</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Upload up to 8 pictures. Landscape format (4:3) works best.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden group">
                      <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {imagePreviewUrls.length < 8 && (
                    <label className="aspect-[4/3] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-colors">
                      <Camera className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-500">Add Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Step 4: Price & Settings */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                step >= 4 ? "bg-pink-100 text-pink-500" : "bg-gray-100 text-gray-400"
              }`}>
                4
              </div>
              <div className="flex-1 space-y-6">
                <h3 className="text-xl font-bold text-gray-800">Price & Settings</h3>
                
                <div>
                  <Label htmlFor="price">Price per day (£)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.pricePerDay || ""}
                    onChange={(e) => setFormData({ ...formData, pricePerDay: parseFloat(e.target.value) || 0 })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., London"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-base">Enable Insurance Protection</Label>
                    <p className="text-sm text-gray-500 mt-1">Add damage protection for renters (£5/day)</p>
                  </div>
                  <Switch
                    checked={formData.insuranceEnabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, insuranceEnabled: checked })}
                  />
                </div>

                <div>
                  <Label htmlFor="cancellation">Cancellation Policy</Label>
                  <select
                    id="cancellation"
                    className="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white mt-2"
                    value={formData.cancellationPolicy}
                    onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })}
                  >
                    <option value="flexible">Flexible - Full refund up to 1 day before</option>
                    <option value="moderate">Moderate - Full refund up to 3 days before</option>
                    <option value="strict">Strict - 50% refund up to 7 days before</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-4">
            {step > 1 && (
              <Button
                variant="outline"
                className="flex-1 h-12 text-lg"
                onClick={() => setStep(step - 1)}
              >
                Previous
              </Button>
            )}
            {step < 4 ? (
              <Button
                className="flex-1 h-12 text-lg bg-pink-500 hover:bg-pink-600"
                onClick={() => canProceedToNext() && setStep(step + 1)}
                disabled={!canProceedToNext()}
              >
                Next Step
              </Button>
            ) : (
              <Button
                className="flex-1 h-12 text-lg bg-pink-500 hover:bg-pink-600"
                onClick={handleSubmit}
                disabled={createMutation.isPending || !canProceedToNext()}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Listing...
                  </>
                ) : (
                  "Create Listing"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </HyggloLayout>
  );
}
