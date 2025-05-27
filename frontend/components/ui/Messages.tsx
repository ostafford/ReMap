import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ReMapColors } from '@/constants/Colors';
import { BodyText, CaptionText } from './Typography';

interface MessageProps {
  children: React.ReactNode;
  title?: string;
  onDismiss?: () => void;
  style?: any;
}

// Success Message - For positive feedback
export const SuccessMessage = ({ 
  children, 
  title = "Success", 
  onDismiss,
  style 
}: MessageProps) => (
  <View style={[styles.messageContainer, styles.successContainer, style]}>
    <View style={styles.messageContent}>
      <BodyText color={ReMapColors.semantic.success} style={styles.messageTitle}>
        ✅ {title}
      </BodyText>
      <BodyText color={ReMapColors.semantic.success} style={styles.messageText}>
        {children}
      </BodyText>
    </View>
    {onDismiss && (
      <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
        <BodyText color={ReMapColors.semantic.success}>✕</BodyText>
      </TouchableOpacity>
    )}
  </View>
);

// Error Message - For error feedback
export const ErrorMessage = ({ 
  children, 
  title = "Error", 
  onDismiss,
  style 
}: MessageProps) => (
  <View style={[styles.messageContainer, styles.errorContainer, style]}>
    <View style={styles.messageContent}>
      <BodyText color={ReMapColors.semantic.error} style={styles.messageTitle}>
        ❌ {title}
      </BodyText>
      <BodyText color={ReMapColors.semantic.error} style={styles.messageText}>
        {children}
      </BodyText>
    </View>
    {onDismiss && (
      <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
        <BodyText color={ReMapColors.semantic.error}>✕</BodyText>
      </TouchableOpacity>
    )}
  </View>
);

// Warning Message - For cautionary feedback
export const WarningMessage = ({ 
  children, 
  title = "Warning", 
  onDismiss,
  style 
}: MessageProps) => (
  <View style={[styles.messageContainer, styles.warningContainer, style]}>
    <View style={styles.messageContent}>
      <BodyText color={ReMapColors.semantic.warning} style={styles.messageTitle}>
        ⚠️ {title}
      </BodyText>
      <BodyText color={ReMapColors.semantic.warning} style={styles.messageText}>
        {children}
      </BodyText>
    </View>
    {onDismiss && (
      <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
        <BodyText color={ReMapColors.semantic.warning}>✕</BodyText>
      </TouchableOpacity>
    )}
  </View>
);

// Info Message - For informational feedback
export const InfoMessage = ({ 
  children, 
  title = "Info", 
  onDismiss,
  style 
}: MessageProps) => (
  <View style={[styles.messageContainer, styles.infoContainer, style]}>
    <View style={styles.messageContent}>
      <BodyText color={ReMapColors.semantic.info} style={styles.messageTitle}>
        ℹ️ {title}
      </BodyText>
      <BodyText color={ReMapColors.semantic.info} style={styles.messageText}>
        {children}
      </BodyText>
    </View>
    {onDismiss && (
      <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
        <BodyText color={ReMapColors.semantic.info}>✕</BodyText>
      </TouchableOpacity>
    )}
  </View>
);

// Toast Message - For temporary notifications
interface ToastProps extends MessageProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export const ToastMessage = ({ 
  children, 
  type = 'info',
  onDismiss,
  style 
}: ToastProps) => {
  const getToastStyle = () => {
    switch (type) {
      case 'success': return styles.successContainer;
      case 'error': return styles.errorContainer;
      case 'warning': return styles.warningContainer;
      default: return styles.infoContainer;
    }
  };

  const getToastColor = () => {
    switch (type) {
      case 'success': return ReMapColors.semantic.success;
      case 'error': return ReMapColors.semantic.error;
      case 'warning': return ReMapColors.semantic.warning;
      default: return ReMapColors.semantic.info;
    }
  };

  return (
    <View style={[styles.toastContainer, getToastStyle(), style]}>
      <BodyText color={getToastColor()} style={styles.toastText}>
        {children}
      </BodyText>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.toastDismiss}>
          <BodyText color={getToastColor()}>✕</BodyText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginVertical: 8,
    backgroundColor: ReMapColors.ui.cardBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  successContainer: {
    borderLeftColor: ReMapColors.semantic.success,
    backgroundColor: '#F0FDF4',
  },
  errorContainer: {
    borderLeftColor: ReMapColors.semantic.error,
    backgroundColor: '#FEF2F2',
  },
  warningContainer: {
    borderLeftColor: ReMapColors.semantic.warning,
    backgroundColor: '#FFFBEB',
  },
  infoContainer: {
    borderLeftColor: ReMapColors.semantic.info,
    backgroundColor: '#EFF6FF',
  },
  messageContent: {
    flex: 1,
  },
  messageTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  messageText: {
    lineHeight: 20,
  },
  dismissButton: {
    marginLeft: 12,
    padding: 4,
  },
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  toastText: {
    flex: 1,
    fontSize: 14,
  },
  toastDismiss: {
    marginLeft: 8,
    padding: 4,
  },
});