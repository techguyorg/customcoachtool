import { Document, Page, Text, View } from '@react-pdf/renderer';
import { pdfStyles, formatPdfDate } from '@/lib/pdf-utils';

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  notes?: string;
}

interface Day {
  name: string;
  dayNumber: number;
  exercises: Exercise[];
  notes?: string;
}

interface Week {
  weekNumber: number;
  name?: string;
  focus?: string;
  days: Day[];
}

interface WorkoutPlanData {
  name: string;
  description?: string;
  goal?: string;
  difficulty: string;
  daysPerWeek: number;
  durationWeeks?: number;
  templateType?: string;
  weeks: Week[];
}

export function WorkoutPlanPdf({ data }: { data: WorkoutPlanData }) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>{data.name}</Text>
          {data.goal && <Text style={pdfStyles.subtitle}>Goal: {data.goal}</Text>}
          <Text style={pdfStyles.date}>Generated on {formatPdfDate(new Date())}</Text>
        </View>

        {/* Overview */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Program Overview</Text>
          <View style={pdfStyles.statsGrid}>
            <View style={pdfStyles.statBox}>
              <Text style={pdfStyles.statValue}>{data.daysPerWeek}</Text>
              <Text style={pdfStyles.statLabel}>Days per Week</Text>
            </View>
            <View style={pdfStyles.statBox}>
              <Text style={pdfStyles.statValue}>{data.durationWeeks || '—'}</Text>
              <Text style={pdfStyles.statLabel}>Duration (Weeks)</Text>
            </View>
            <View style={pdfStyles.statBox}>
              <Text style={pdfStyles.statValue}>{data.difficulty}</Text>
              <Text style={pdfStyles.statLabel}>Difficulty</Text>
            </View>
            {data.templateType && (
              <View style={pdfStyles.statBox}>
                <Text style={pdfStyles.statValue}>{data.templateType.replace(/_/g, ' ')}</Text>
                <Text style={pdfStyles.statLabel}>Type</Text>
              </View>
            )}
          </View>
          
          {data.description && (
            <Text style={{ color: '#6b7280', fontSize: 10, lineHeight: 1.5 }}>
              {data.description}
            </Text>
          )}
        </View>

        {/* Program Structure */}
        {data.weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={pdfStyles.section} wrap={false}>
            <Text style={pdfStyles.sectionTitle}>
              Week {week.weekNumber}{week.name ? `: ${week.name}` : ''}
              {week.focus ? ` - ${week.focus}` : ''}
            </Text>
            
            {week.days.map((day, dayIndex) => (
              <View key={dayIndex} style={pdfStyles.mealCard}>
                <Text style={pdfStyles.mealTitle}>Day {day.dayNumber}: {day.name}</Text>
                
                {day.exercises.length > 0 ? (
                  <View style={{ marginTop: 8 }}>
                    {day.exercises.map((exercise, exIndex) => (
                      <View key={exIndex} style={pdfStyles.exerciseItem}>
                        <Text style={{ flex: 2, color: '#1f2937', fontSize: 9 }}>
                          {exIndex + 1}. {exercise.name}
                        </Text>
                        <Text style={{ color: '#6b7280', fontSize: 9 }}>
                          {exercise.sets} × {exercise.reps}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={{ color: '#9ca3af', fontSize: 9, fontStyle: 'italic' }}>
                    Rest Day
                  </Text>
                )}
                
                {day.notes && (
                  <Text style={{ color: '#6b7280', fontSize: 8, marginTop: 6, fontStyle: 'italic' }}>
                    Note: {day.notes}
                  </Text>
                )}
              </View>
            ))}
          </View>
        ))}

        {/* Footer */}
        <Text style={pdfStyles.footer}>
          CustomCoachPro - Workout Plan • {formatPdfDate(new Date())}
        </Text>
      </Page>
    </Document>
  );
}
