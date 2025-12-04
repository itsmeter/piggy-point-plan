-- Add columns to track equipped shop items
ALTER TABLE public.user_settings 
ADD COLUMN active_frame_id uuid REFERENCES public.shop_items(id),
ADD COLUMN active_icon_id uuid REFERENCES public.shop_items(id),
ADD COLUMN active_background_id uuid REFERENCES public.shop_items(id);