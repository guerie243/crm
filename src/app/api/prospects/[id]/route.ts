import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateScore } from '@/lib/logic';
import { ProspectUpdate } from '@/types/prospect';

export const dynamic = 'force-dynamic';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body: ProspectUpdate = await request.json();

        // On récupère l'ancier prospect pour fusionner et calculer un score exact
        const { data: oldProspect, error: fetchError } = await supabase
            .from('prospects')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        const mergedBody = { ...oldProspect, ...body };
        const score = calculateScore(mergedBody);

        const { data, error } = await supabase
            .from('prospects')
            .update({ ...body, score, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { error } = await supabase
            .from('prospects')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
