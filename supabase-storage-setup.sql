-- Create storage bucket for health record attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('health-records', 'health-records', true);

-- Set up storage policies for health records
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload health records" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'health-records' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to view their own health record files
CREATE POLICY "Allow authenticated users to view health records" ON storage.objects
FOR SELECT USING (
  bucket_id = 'health-records' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own health record files
CREATE POLICY "Allow authenticated users to update health records" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'health-records' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their own health record files
CREATE POLICY "Allow authenticated users to delete health records" ON storage.objects
FOR DELETE USING (
  bucket_id = 'health-records' 
  AND auth.role() = 'authenticated'
); 