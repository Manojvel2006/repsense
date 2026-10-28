import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Keyboard, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '@navigation/types';
import { useAuthStore } from '@store/authStore';
import { apiService } from '@services/api';
import { colors, spacing, borderRadius, typography, shadows } from '@theme';
import { Ionicons } from '@expo/vector-icons';

type ProfileNavigationProp = NativeStackNavigationProp<MainTabParamList, 'Profile'>;

export const ProfileScreen = () => {
  const navigation = useNavigation<ProfileNavigationProp>();
  const { user, updateProfile, logout, isLoading: authLoading, isAuthenticated, fetchProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      populateForm(user);
    }
  }, [isAuthenticated, user]);

  const populateForm = (userData: any) => {
    setName(userData.name || '');
    setAge(userData.age?.toString() || '');
    setGender(userData.gender || 'male');
    setHeight(userData.height?.toString() || '');
    setWeight(userData.weight?.toString() || '');
    setFitnessGoal(userData.fitnessGoal || '');
  };

  const handleSave = async () => {
    if (!name) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile({
        name,
        age: age ? parseInt(age, 10) : undefined,
        gender,
        height: height ? parseInt(height, 10) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        fitnessGoal: fitnessGoal || undefined,
      });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      // Error handled in store
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  if (authLoading && !user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.profileName}>{user?.name || 'User'}</Text>
        <Text style={styles.profileEmail}>{user?.email || ''}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, isEditing ? {} : styles.inputDisabled]}
              value={name}
              onChangeText={setName}
              editable={isEditing}
              placeholder="John Doe"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={[styles.input, isEditing ? {} : styles.inputDisabled]}
                value={age}
                onChangeText={setAge}
                editable={isEditing}
                placeholder="25"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>Gender</Text>
              {isEditing ? (
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
              ) : (
                <Text style={styles.inputDisabled}>
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                style={[styles.input, isEditing ? {} : styles.inputDisabled]}
                value={height}
                onChangeText={setHeight}
                editable={isEditing}
                placeholder="175"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={[styles.input, isEditing ? {} : styles.inputDisabled]}
                value={weight}
                onChangeText={setWeight}
                editable={isEditing}
                placeholder="70"
                keyboardType="decimal-pad"
                maxLength={5}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fitness Goal</Text>
            <TextInput
              style={[styles.input, isEditing ? {} : styles.inputDisabled]}
              value={fitnessGoal}
              onChangeText={setFitnessGoal}
              editable={isEditing}
              placeholder="Build muscle, lose weight, stay fit..."
              multiline
              numberOfLines={3}
              autoCapitalize="sentences"
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device</Text>
        <View style={styles.card}>
          <View style={styles.deviceRow}>
            <View style={styles.deviceIcon}>
              <Ionicons name="bandage" size={28} color={colors.primary} />
            </View>
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceName}>RepSense Band</Text>
              <Text style={styles.deviceStatus}>
                <View style={styles.statusDotConnected} />
                Connected
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingsList}>
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="notifications" size={24} color={colors.textPrimary} />
            <Text style={styles.settingText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="shield" size={24} color={colors.textPrimary} />
            <Text style={styles.settingText}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="help-circle" size={24} color={colors.textPrimary} />
            <Text style={styles.settingText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="information-circle" size={24} color={colors.textPrimary} />
            <Text style={styles.settingText}>About</Text>
            <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </View>

      {isEditing ? (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => { populateForm(user!); setIsEditing(false); }} activeOpacity={0.8}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.saveButton, isSaving && styles.buttonDisabled]} 
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            <Text style={styles.saveText}>{isSaving ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)} activeOpacity={0.8}>
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
        <Ionicons name="log-out" size={20} color={colors.error} style={styles.logoutIcon} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>RepSense v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  profileName: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  profileEmail: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  inputGroup: {
    marginBottom: spacing.md,
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
  inputDisabled: {
    backgroundColor: colors.surface,
    borderColor: colors.transparent,
    color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputGroupHalf: {
    flex: 1,
    marginBottom: spacing.md,
    gap: spacing.xs,
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
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  deviceIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  deviceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    fontSize: typography.fontSize.sm,
    color: colors.success,
  },
  statusDotConnected: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  settingsList: {
    gap: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.md,
  },
  settingText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  editButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
    ...shadows.sm,
  },
  editText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    marginTop: spacing.xl,
  },
  logoutIcon: {
    marginRight: spacing.xs,
  },
  logoutText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
  },
  versionContainer: {
    marginTop: spacing.xxl,
    alignItems: 'center',
  },
  versionText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
});