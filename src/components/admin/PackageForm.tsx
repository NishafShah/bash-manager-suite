import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Loader2 } from "lucide-react";

const packageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be positive"),
  duration: z.string().optional(),
  capacity: z.number().min(1, "Capacity must be at least 1").optional(),
  features: z.string().min(1, "Features are required"),
});

type PackageFormData = z.infer<typeof packageSchema>;

interface PackageFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  package?: any;
}

export const PackageForm = ({ onSuccess, onCancel, package: editPackage }: PackageFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(editPackage?.image_url || "");
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: editPackage ? {
      title: editPackage.title,
      description: editPackage.description,
      price: Number(editPackage.price),
      duration: editPackage.duration,
      capacity: editPackage.capacity,
      features: editPackage.package_features?.map((f: any) => f.feature_text).join('\n') || '',
    } : undefined,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `packages/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('package-images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('package-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const onSubmit = async (data: PackageFormData) => {
    setIsLoading(true);
    try {
      let imageUrl = editPackage?.image_url || '';

      // Upload new image if provided
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      // Prepare package data
      const packageData = {
        title: data.title,
        description: data.description,
        price: data.price,
        duration: data.duration,
        capacity: data.capacity,
        image_url: imageUrl,
        is_active: true,
      };

      let packageId = editPackage?.id;

      if (editPackage) {
        // Update existing package
        const { error: updateError } = await supabase
          .from('service_packages')
          .update(packageData)
          .eq('id', editPackage.id);

        if (updateError) throw updateError;

        // Delete existing features
        await supabase
          .from('package_features')
          .delete()
          .eq('package_id', editPackage.id);
      } else {
        // Create new package
        const { data: newPackage, error: insertError } = await supabase
          .from('service_packages')
          .insert(packageData)
          .select()
          .single();

        if (insertError) throw insertError;
        packageId = newPackage.id;
      }

      // Add features
      const features = data.features.split('\n').filter(f => f.trim());
      if (features.length > 0) {
        const featureData = features.map(feature => ({
          package_id: packageId,
          feature_text: feature.trim(),
          is_included: true,
        }));

        const { error: featuresError } = await supabase
          .from('package_features')
          .insert(featureData);

        if (featuresError) throw featuresError;
      }

      toast({
        title: "Success",
        description: `Package ${editPackage ? 'updated' : 'created'} successfully`,
      });

      onSuccess();
    } catch (error: any) {
      console.error('Package form error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save package",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{editPackage ? 'Edit Package' : 'Create New Package'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Package Title</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="e.g., Premium Wedding Package"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe your package offering..."
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (PKR)</Label>
              <Input
                id="price"
                type="number"
                {...register("price", { valueAsNumber: true })}
                placeholder="50000"
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                {...register("duration")}
                placeholder="e.g., 3-4 hours"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                {...register("capacity", { valueAsNumber: true })}
                placeholder="100"
              />
              {errors.capacity && (
                <p className="text-sm text-destructive">{errors.capacity.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="features">Features (one per line)</Label>
            <Textarea
              id="features"
              {...register("features")}
              placeholder="Professional photography&#10;Decorations included&#10;Catering service&#10;Sound system"
              rows={6}
            />
            {errors.features && (
              <p className="text-sm text-destructive">{errors.features.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Package Image</Label>
            <div className="flex items-center gap-4">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('image')?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {imageFile ? 'Change Image' : 'Upload Image'}
              </Button>
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editPackage ? 'Update Package' : 'Create Package'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};