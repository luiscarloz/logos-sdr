import { inject, injectable } from 'tsyringe';
import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '../../shared/utils/logger.js';

export interface AvailableSlot {
  date: string;
  startTime: string;
  endTime: string;
  agentName?: string;
}

export interface Appointment {
  id: string;
  tenant_id: string;
  lead_id: string;
  conversation_id?: string;
  agent_name?: string;
  scheduled_at: string;
  duration_minutes: number;
  type?: string;
  notes?: string;
  status: string;
  created_at: string;
}

@injectable()
export class SchedulingService {
  constructor(
    @inject('SupabaseClient') private db: SupabaseClient,
    @inject('Logger') private logger: Logger,
  ) {}

  async getAvailableSlots(
    tenantId: string,
    dateFrom: string,
    dateTo: string,
  ): Promise<AvailableSlot[]> {
    // Get availability templates
    const { data: slots } = await this.db
      .from('availability_slots')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('active', true);

    if (!slots || slots.length === 0) return [];

    // Get existing appointments in range
    const { data: appointments } = await this.db
      .from('appointments')
      .select('*')
      .eq('tenant_id', tenantId)
      .gte('scheduled_at', dateFrom)
      .lte('scheduled_at', dateTo)
      .neq('status', 'cancelled');

    const bookedTimes = new Set(
      (appointments ?? []).map(
        (a: Appointment) => `${a.agent_name}:${a.scheduled_at}`,
      ),
    );

    // Generate available slots for the date range
    const available: AvailableSlot[] = [];
    const from = new Date(dateFrom);
    const to = new Date(dateTo);

    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      const dateStr = d.toISOString().split('T')[0];

      for (const slot of slots) {
        if (slot.day_of_week !== dayOfWeek) continue;

        // Generate time slots within the range
        const [startH, startM] = slot.start_time.split(':').map(Number);
        const [endH, endM] = slot.end_time.split(':').map(Number);
        const duration = slot.slot_duration_minutes;

        let currentMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        while (currentMinutes + duration <= endMinutes) {
          const hours = Math.floor(currentMinutes / 60);
          const mins = currentMinutes % 60;
          const timeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
          const scheduledAt = `${dateStr}T${timeStr}:00`;

          const key = `${slot.agent_name}:${scheduledAt}`;
          if (!bookedTimes.has(key)) {
            available.push({
              date: dateStr,
              startTime: timeStr,
              endTime: `${String(Math.floor((currentMinutes + duration) / 60)).padStart(2, '0')}:${String((currentMinutes + duration) % 60).padStart(2, '0')}`,
              agentName: slot.agent_name,
            });
          }

          currentMinutes += duration;
        }
      }
    }

    return available;
  }

  async formatSlotsForPrompt(slots: AvailableSlot[]): Promise<string> {
    if (slots.length === 0) return 'Não há horários disponíveis no momento.';

    const grouped: Record<string, AvailableSlot[]> = {};
    for (const slot of slots) {
      if (!grouped[slot.date]) grouped[slot.date] = [];
      grouped[slot.date].push(slot);
    }

    return Object.entries(grouped)
      .map(([date, daySlots]) => {
        const times = daySlots
          .map(
            (s) =>
              `${s.startTime}-${s.endTime}${s.agentName ? ` (${s.agentName})` : ''}`,
          )
          .join(', ');
        return `${date}: ${times}`;
      })
      .join('\n');
  }

  async book(params: {
    tenantId: string;
    leadId: string;
    conversationId?: string;
    scheduledAt: string;
    agentName?: string;
    durationMinutes?: number;
    type?: string;
    notes?: string;
  }): Promise<Appointment> {
    const { data, error } = await this.db
      .from('appointments')
      .insert({
        tenant_id: params.tenantId,
        lead_id: params.leadId,
        conversation_id: params.conversationId,
        agent_name: params.agentName,
        scheduled_at: params.scheduledAt,
        duration_minutes: params.durationMinutes ?? 60,
        type: params.type,
        notes: params.notes,
        status: 'confirmed',
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to book appointment: ${error.message}`);

    this.logger.info(
      { appointmentId: data.id, leadId: params.leadId, scheduledAt: params.scheduledAt },
      'Appointment booked',
    );

    return data as Appointment;
  }

  async cancel(appointmentId: string): Promise<void> {
    await this.db
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointmentId);
  }

  async getByLead(leadId: string): Promise<Appointment[]> {
    const { data } = await this.db
      .from('appointments')
      .select('*')
      .eq('lead_id', leadId)
      .order('scheduled_at', { ascending: true });

    return (data ?? []) as Appointment[];
  }
}
