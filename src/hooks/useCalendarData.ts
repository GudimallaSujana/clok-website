import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCalendarStore } from '@/store/calendarStore';
import { toast } from 'sonner';

export function useCalendarData() {
  const { user } = useAuth();
  const {
    setNotes, setTasks, setBirthdays, setTileColors, setDayImages,
    setLoading,
  } = useCalendarStore();

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [calRes, taskRes, bdayRes] = await Promise.all([
        supabase.from('calendar_data').select('*').eq('user_id', user.id),
        supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('birthdays').select('*').eq('user_id', user.id).order('date'),
      ]);

      if (calRes.data) {
        const notes = calRes.data
          .filter((d) => d.note)
          .map((d) => ({ id: d.id, date: d.date, text: d.note!, color: d.note_color || 'hsl(48, 95%, 76%)' }));
        const colors: Record<string, string> = {};
        const images: Record<string, string> = {};
        calRes.data.forEach((d) => {
          if (d.tile_color) colors[d.date] = d.tile_color;
          if (d.image_url) images[d.date] = d.image_url;
        });
        setNotes(notes);
        setTileColors(colors);
        setDayImages(images);
      }

      if (taskRes.data) {
        setTasks(taskRes.data.map((t) => ({ id: t.id, title: t.title, completed: t.completed, date: t.date || undefined })));
      }

      if (bdayRes.data) {
        setBirthdays(bdayRes.data.map((b) => ({ id: b.id, name: b.name, date: b.date })));
      }
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [user, setNotes, setTasks, setBirthdays, setTileColors, setDayImages, setLoading]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // DB operations
  const addNoteDB = async (date: string, text: string, color: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('calendar_data')
      .upsert({ user_id: user.id, date, note: text, note_color: color }, { onConflict: 'user_id,date' })
      .select()
      .single();
    if (error) { toast.error('Failed to save note'); return; }
    return data;
  };

  const deleteNoteDB = async (id: string) => {
    if (!user) return;
    await supabase.from('calendar_data').update({ note: null, note_color: null }).eq('id', id).eq('user_id', user.id);
  };

  const addTaskDB = async (title: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('tasks')
      .insert({ user_id: user.id, title, completed: false })
      .select()
      .single();
    if (error) { toast.error('Failed to save task'); return; }
    return data;
  };

  const toggleTaskDB = async (id: string, completed: boolean) => {
    if (!user) return;
    await supabase.from('tasks').update({ completed }).eq('id', id).eq('user_id', user.id);
  };

  const deleteTaskDB = async (id: string) => {
    if (!user) return;
    await supabase.from('tasks').delete().eq('id', id).eq('user_id', user.id);
  };

  const addBirthdayDB = async (name: string, date: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('birthdays')
      .insert({ user_id: user.id, name, date })
      .select()
      .single();
    if (error) { toast.error('Failed to save birthday'); return; }
    return data;
  };

  const deleteBirthdayDB = async (id: string) => {
    if (!user) return;
    await supabase.from('birthdays').delete().eq('id', id).eq('user_id', user.id);
  };

  const uploadDayImage = async (date: string, file: File) => {
    if (!user) return;
    const path = `${user.id}/${date}-${Date.now()}.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage.from('calendar-images').upload(path, file);
    if (uploadError) { toast.error('Failed to upload image'); return; }
    const { data: urlData } = supabase.storage.from('calendar-images').getPublicUrl(path);
    const url = urlData.publicUrl;
    await supabase
      .from('calendar_data')
      .upsert({ user_id: user.id, date, image_url: url }, { onConflict: 'user_id,date' });
    return url;
  };

  const uploadHeroImage = async (file: File, month: string) => {
    if (!user) return;
    const path = `${user.id}/hero-${month}-${Date.now()}.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage.from('calendar-images').upload(path, file);
    if (uploadError) { toast.error('Failed to upload hero image'); return; }
    const { data: urlData } = supabase.storage.from('calendar-images').getPublicUrl(path);
    return urlData.publicUrl;
  };

  const setTileColorDB = async (date: string, color: string) => {
    if (!user) return;
    await supabase
      .from('calendar_data')
      .upsert({ user_id: user.id, date, tile_color: color }, { onConflict: 'user_id,date' });
  };

  return {
    fetchAll,
    addNoteDB, deleteNoteDB,
    addTaskDB, toggleTaskDB, deleteTaskDB,
    addBirthdayDB, deleteBirthdayDB,
    uploadDayImage, uploadHeroImage,
    setTileColorDB,
  };
}
