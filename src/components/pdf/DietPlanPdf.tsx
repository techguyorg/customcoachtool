import { Document, Page, Text, View } from '@react-pdf/renderer';
import { pdfStyles, formatPdfDate } from '@/lib/pdf-utils';

interface FoodItem {
  name: string;
  quantity: number;
  unit: string;
  calories?: number;
}

interface Meal {
  name: string;
  time?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  foods: FoodItem[];
  notes?: string;
}

interface DietPlanData {
  name: string;
  description?: string;
  goal?: string;
  dietaryType?: string;
  caloriesTarget?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
  mealsPerDay?: number;
  meals: Meal[];
  notes?: string;
}

export function DietPlanPdf({ data }: { data: DietPlanData }) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>{data.name}</Text>
          {data.goal && <Text style={pdfStyles.subtitle}>Goal: {data.goal}</Text>}
          <Text style={pdfStyles.date}>Generated on {formatPdfDate(new Date())}</Text>
        </View>

        {/* Description */}
        {data.description && (
          <View style={pdfStyles.section}>
            <Text style={{ color: '#6b7280', fontSize: 10, lineHeight: 1.5 }}>
              {data.description}
            </Text>
          </View>
        )}

        {/* Daily Macros */}
        {data.caloriesTarget && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>Daily Macros</Text>
            <View style={pdfStyles.statsGrid}>
              <View style={pdfStyles.statBox}>
                <Text style={pdfStyles.statValue}>{data.caloriesTarget}</Text>
                <Text style={pdfStyles.statLabel}>Calories (kcal)</Text>
              </View>
              <View style={pdfStyles.statBox}>
                <Text style={pdfStyles.statValue}>{data.proteinGrams || 0}g</Text>
                <Text style={pdfStyles.statLabel}>Protein</Text>
              </View>
              <View style={pdfStyles.statBox}>
                <Text style={pdfStyles.statValue}>{data.carbsGrams || 0}g</Text>
                <Text style={pdfStyles.statLabel}>Carbs</Text>
              </View>
              <View style={pdfStyles.statBox}>
                <Text style={pdfStyles.statValue}>{data.fatGrams || 0}g</Text>
                <Text style={pdfStyles.statLabel}>Fat</Text>
              </View>
            </View>
          </View>
        )}

        {/* Plan Info */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Plan Details</Text>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>Dietary Type</Text>
            <Text style={pdfStyles.value}>{data.dietaryType || 'Standard'}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>Meals Per Day</Text>
            <Text style={pdfStyles.value}>{data.mealsPerDay || data.meals.length}</Text>
          </View>
        </View>

        {/* Meals */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Meal Structure</Text>
          
          {data.meals.map((meal, index) => (
            <View key={index} style={pdfStyles.mealCard} wrap={false}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={pdfStyles.mealTitle}>{meal.name}</Text>
                {meal.calories && (
                  <Text style={{ fontSize: 10, color: '#6b7280' }}>{meal.calories} kcal</Text>
                )}
              </View>
              
              {meal.time && (
                <Text style={pdfStyles.mealTime}>Suggested time: {meal.time}</Text>
              )}
              
              {(meal.protein || meal.carbs || meal.fat) && (
                <View style={pdfStyles.macroRow}>
                  {meal.protein && <Text style={pdfStyles.macroItem}>P: {meal.protein}g</Text>}
                  {meal.carbs && <Text style={pdfStyles.macroItem}>C: {meal.carbs}g</Text>}
                  {meal.fat && <Text style={pdfStyles.macroItem}>F: {meal.fat}g</Text>}
                </View>
              )}
              
              {meal.foods.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <Text style={{ fontSize: 9, color: '#6b7280', marginBottom: 4 }}>Food Items:</Text>
                  {meal.foods.map((food, foodIndex) => (
                    <View key={foodIndex} style={pdfStyles.exerciseItem}>
                      <Text style={{ color: '#1f2937', fontSize: 9 }}>{food.name}</Text>
                      <Text style={{ color: '#6b7280', fontSize: 9 }}>
                        {food.quantity} {food.unit}
                        {food.calories && ` • ${food.calories} kcal`}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              
              {meal.notes && (
                <Text style={{ color: '#6b7280', fontSize: 8, marginTop: 6, fontStyle: 'italic' }}>
                  {meal.notes}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Notes */}
        {data.notes && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>Notes</Text>
            <Text style={{ color: '#6b7280', fontSize: 10, lineHeight: 1.5 }}>
              {data.notes}
            </Text>
          </View>
        )}

        {/* Footer */}
        <Text style={pdfStyles.footer}>
          CustomCoachPro - Diet Plan • {formatPdfDate(new Date())}
        </Text>
      </Page>
    </Document>
  );
}
