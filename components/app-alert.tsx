import { useEffect, useState } from 'react';
import { Alert, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import type { AlertButton } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

type AlertRequest = {
  title: string;
  message?: string;
  buttons: AlertButton[];
};

let setCurrentAlert: ((request: AlertRequest | null) => void) | null = null;

// αντικαταστάτης του Alert.alert() που δουλεύει ΚΑΙ στο web. Στο native καλεί απευθείας το πραγματικό
// Alert.alert (καμία αλλαγή συμπεριφοράς - παραμένει το native OS dialog). Στο web δείχνει ένα δικό μας
// Modal, γιατί το react-native-web's Alert.alert() είναι πλήρες no-op:
// node_modules/react-native-web/src/exports/Alert/index.js -> `static alert() {}` - δεν κάνει τίποτα,
// ούτε καν crash, απλά "καταπίνει" την κλήση. Γι' αυτό κουμπιά σαν το "Επεξεργασία ταξιδιού" έμοιαζαν
// νεκρά στο web: το Alert.alert() που άνοιγε το menu απλά δεν έκανε τίποτα.
export function showAlert(title: string, message?: string, buttons?: AlertButton[]): void {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }

  const resolvedButtons = buttons && buttons.length > 0 ? buttons : [{ text: 'OK' }];
  setCurrentAlert?.({ title, message, buttons: resolvedButtons });
}

// mount μία φορά κοντά στη ρίζα (app/_layout.tsx) - δείχνει το τρέχον alert σαν Modal. Δεν κάνει τίποτα
// στο native (εκεί το showAlert πάει κατευθείαν στο πραγματικό Alert.alert, ποτέ σε αυτό το component).
export function AppAlertHost() {
  const [alert, setAlert] = useState<AlertRequest | null>(null);
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'icon');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    setCurrentAlert = setAlert;
    return () => {
      setCurrentAlert = null;
    };
  }, []);

  if (Platform.OS !== 'web') return null;

  const handlePress = (button: AlertButton) => {
    setAlert(null);
    button.onPress?.();
  };

  return (
    <Modal visible={alert !== null} transparent animationType="fade" onRequestClose={() => setAlert(null)}>
      <View style={styles.overlay}>
        {alert && (
          <View style={[styles.card, { backgroundColor, borderColor }]}>
            <ThemedText style={styles.title}>{alert.title}</ThemedText>
            {alert.message ? <ThemedText style={styles.message}>{alert.message}</ThemedText> : null}
            <View style={styles.buttons}>
              {alert.buttons.map((button, index) => (
                <Pressable
                  key={index}
                  style={[styles.button, { borderColor }]}
                  onPress={() => handlePress(button)}>
                  <ThemedText
                    style={[
                      styles.buttonText,
                      { color: textColor },
                      button.style === 'destructive' && styles.destructiveText,
                      button.style === 'cancel' && styles.cancelText,
                    ]}>
                    {button.text}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  message: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 16,
  },
  buttons: {
    gap: 8,
  },
  button: {
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  destructiveText: {
    color: '#ff3b30',
  },
  cancelText: {
    opacity: 0.6,
  },
});
