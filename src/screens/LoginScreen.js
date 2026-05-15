import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

const users = {
  admin: {
    password: 'nimda',
    role: 'administrator',
    label: 'Администратор',
  },
  user: {
    password: 'user123',
    role: 'user',
    label: 'Потребител',
  },
};

export default function LoginScreen({ onLogin }) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(Math.max(width - 180, 220), 430);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    const normalizedUsername = username.trim().toLowerCase();
    const matchedUser = users[normalizedUsername];

    if (!matchedUser || matchedUser.password !== password) {
      setError('Невалидно потребителско име или парола.');
      return;
    }

    setError('');
    onLogin({
      username: normalizedUsername,
      role: matchedUser.role,
      label: matchedUser.label,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.card, { width: cardWidth }]}>
        <Text style={styles.title}>Вход в системата</Text>
        <Text style={styles.subtitle}>Въведете потребителско име и парола</Text>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Потребителско име</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="admin или user"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Парола</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Въведете парола"
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>Вход</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f6f9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    boxSizing: 'border-box',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: '#dce4ec',
    elevation: 3,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#005eb8',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 6,
  },
  form: {
    marginTop: 24,
    gap: 14,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '700',
  },
  input: {
    boxSizing: 'border-box',
    width: '100%',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#dce4ec',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#172033',
  },
  error: {
    color: '#d32f2f',
    fontSize: 14,
    fontWeight: '700',
  },
  button: {
    boxSizing: 'border-box',
    width: '100%',
    backgroundColor: '#005eb8',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonPressed: {
    transform: [{ scale: 0.99 }],
    backgroundColor: '#004f9c',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
});
