import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCalendarStore } from '@/store/calendarStore';
import { toast } from 'sonner';

export function useCalendarData() {
  const { user } = useAuth();
  const {
    setNotes, setTasks, setBirthdays, setTileColors, setDayImages,
    setLoading, setEmojiReactions, setHeroImage, setSchedules,
  } = useCalendarStore();

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [calRes, taskRes, bdayRes, heroRes, schedRes] = await Promise.all([
        supabase.from('calendar_data').select('*').eq('user_id', user.id),
        supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('birthdays').select('*').eq('user_id', user.id).order('date'),
        supabase.from('hero_images').select('*').eq('user_id', user.id),
        supabase.from('schedules').select('*').eq('user_id', user.id).order('start_date'),
      ]);

      if (calRes.data) {
        const notes = calRes.data
          .filter((d) => d.note)
          .map((d) => ({ id: d.id, date: d.date, text: d.note!, color: d.note_color || 'hsl(48, 95%, 76%)' }));
        const colors: Record<string, string> = {};
        const images: Record<string, string> = {};
        const reactions: Record<string, string[]> = {};
        calRes.data.forEach((d) => {
          if (d.tile_color) colors[d.date] = d.tile_color;
          if (d.image_url) images[d.date] = d.image_url;
          if ((d as any).emoji_reactions) {
            try { reactions[d.date] = JSON.parse((d as any).emoji_reactions); } catch {}
          }
        });
        setNotes(notes);
        setTileColors(colors);
        setDayImages(images);
        setEmojiReactions(reactions);
      }

      if (taskRes.data) {
        setTasks(taskRes.data.map((t) => ({ id: t.id, title: t.title, completed: t.completed, date: t.date || undefined })));
      }

      if (bdayRes.data) {
        setBirthdays(bdayRes.data.map((b) => ({ id: b.id, name: b.name, date: b.date })));
      }

      if (heroRes.data) {
        heroRes.data.forEach((h: any) => setHeroImage(h.month_key, h.image_url));
      }

      if (schedRes.data) {
        setSchedules(schedRes.data.map((s: any) => ({ id: s.id, title: s.title, start_date: s.start_date, end_date: s.end_date || undefined })));
      }
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [user, setNotes, setTasks, setBirthdays, setTileColors, setDayImages, setLoading, setEmojiReactions, setHeroImage, setSchedules]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addNoteDB = async (date: string, text: string, color: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('calendar_data')
      .upsert({ user_id: user.id, date, note: text, note_color: color } as any, { onConflict: 'user_id,date' })
      .select()
      .single();
    if (error) { toast.error('Failed to save note'); return; }
    return data;
  };

  const deleteNoteDB = async (id: string) => {
    if (!user) return;
    await supabase.from('calendar_data').update({ note: null, note_color: null }).eq('id', id).eq('user_id', user.id);
  };

  const addTaskDB = async (title: string, date?: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('tasks')
      .insert({ user_id: user.id, title, completed: false, date: date || null })
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
      .upsert({ user_id: user.id, date, image_url: url } as any, { onConflict: 'user_id,date' });
    return url;
  };

  const deleteDayImageDB = async (date: string) => {
    if (!user) return;
    await supabase.from('calendar_data').update({ image_url: null }).eq('user_id', user.id).eq('date', date);
  };

  const uploadHeroImage = async (file: File, month: string) => {
    if (!user) return;
    const path = `${user.id}/hero-${month}-${Date.now()}.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage.from('calendar-images').upload(path, file);
    if (uploadError) { toast.error('Failed to upload hero image'); return; }
    const { data: urlData } = supabase.storage.from('calendar-images').getPublicUrl(path);
    const url = urlData.publicUrl;
    await supabase
      .from('hero_images' as any)
      .upsert({ user_id: user.id, month_key: month, image_url: url }, { onConflict: 'user_id,month_key' });
    return url;
  };

  const deleteHeroImageDB = async (month: string) => {
    if (!user) return;
    await supabase.from('hero_images' as any).delete().eq('user_id', user.id).eq('month_key', month);
  };

  const setTileColorDB = async (date: string, color: string) => {
    if (!user) return;
    await supabase
      .from('calendar_data')
      .upsert({ user_id: user.id, date, tile_color: color } as any, { onConflict: 'user_id,date' });
  };

  const setEmojiReactionDB = async (date: string, emojis: string[]) => {
    if (!user) return;
    await supabase
      .from('calendar_data')
      .upsert({ user_id: user.id, date, emoji_reactions: JSON.stringify(emojis) } as any, { onConflict: 'user_id,date' });
  };

  const addScheduleDB = async (title: string, start_date: string, end_date?: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('schedules')
      .insert({ user_id: user.id, title, start_date, end_date: end_date || null } as any)
      .select()
      .single();
    if (error) { toast.error('Failed to save schedule'); return; }
    return data;
  };

  const deleteScheduleDB = async (id: string) => {
    if (!user) return;
    await supabase.from('schedules').delete().eq('id', id).eq('user_id', user.id);
  };

  return {
    fetchAll,
    addNoteDB, deleteNoteDB,
    addTaskDB, toggleTaskDB, deleteTaskDB,
    addBirthdayDB, deleteBirthdayDB,
    addScheduleDB, deleteScheduleDB,
    uploadDayImage, uploadHeroImage,
    deleteDayImageDB, deleteHeroImageDB,
    setTileColorDB, setEmojiReactionDB,
  };
}
