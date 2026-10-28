import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Keyboard, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/types';
import { useAuthStore } from '@store/authStore';
import { colors, spacing, borderRadius, typography, shadows } from '@theme';

type ProfileSetupNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProfileSetup'>;

export const ProfileSetupScreen = () => {
  const navigation = useNavigation<ProfileSetupNavigationProp>();
  const { updateProfile, isLoading, error, clearError } = useAuthStore();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('');

  const handleSubmit = async () => {
    if (!name) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    try {
      await updateProfile({
        name,
        age: age ? parseInt(age, 10) : undefined,
        gender,
        height: height ? parseInt(height, 10) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        fitnessGoal: fitnessGoal || undefined,
      });
      clearError();
      navigation.navigate('ConnectDevice');
    } catch {
      // Error handled in store
    }
  };

  React.useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error, clearError]);

  return (
    <View style={styles.container}>
      
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>Help us personalize your RepSense experience</Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="John Doe"
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
              />
            </View>

            <View style={styles.row}>
              <View style={styles.inputGroupHalf}>
                <Text style={styles.label}>Age</Text>
                <TextInput
                  style={styles.input}
                  value={age}
                  onChangeText={setAge}
                  placeholder="25"
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
              <View style={styles.inputGroupHalf}>
                <Text style={styles.label}>Gender</Text>
                <View style={styles.genderSelector}>
                  {['male', 'female', 'other'].map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[
                        styles.genderOption,
                        gender === g && styles.genderOptionSelected,
                      ]}
                      onPress={() => setGender(g as 'male' | 'female' | 'other')}
                    >
                      <Text style={[
                        styles.genderOptionText,
                        gender === g && styles.genderOptionTextSelected,
                      ]}>
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.inputGroupHalf}>
                <Text style={styles.label}>Height (cm)</Text>
                <TextInput
                  style={styles.input}
                  value={height}
                  onChangeText={setHeight}
                  placeholder="175"
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
              <View style={styles.inputGroupHalf}>
                <Text style={styles.label}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="70"
                  keyboardType="decimal-pad"
                  maxLength={5}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fitness Goal</Text>
              <TextInput
                style={styles.input}
                value={fitnessGoal}
                onChangeText={setFitnessGoal}
                placeholder="Build muscle, lose weight, stay fit..."
                multiline
                numberOfLines={3}
                autoCapitalize="sentences"
              />
            </View>

            <TouchableOpacity 
              style={[styles.primaryButton, isLoading && styles.buttonDisabled]} 
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>
                {isLoading ? 'Saving...' : 'Continue'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.md,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  form: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  inputGroupHalf: {
    flex: 1,
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
  },
  genderSelector: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  genderOption: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  genderOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  genderOptionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  genderOptionTextSelected: {
    color: colors.primary,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    ...shadows.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});