import React from 'react';
import { Platform, StyleSheet, TextInput } from 'react-native';

const displayDateToInputDate = value => {
  if (!value) return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const match = value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) return '';

  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const inputDateToDisplayDate = value => {
  if (!value) return '';

  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}.${month}.${year}` : value;
};

export default function DateInput({ value, onChangeText, style, ...props }) {
  if (Platform.OS === 'web') {
    return React.createElement('input', {
      ...props,
      type: 'date',
      value: displayDateToInputDate(value),
      onChange: event => onChangeText(inputDateToDisplayDate(event.target.value)),
      style: StyleSheet.flatten([styles.webInput, style]),
    });
  }

  return (
    <TextInput
      {...props}
      style={style}
      value={value}
      onChangeText={onChangeText}
      keyboardType="numbers-and-punctuation"
      placeholder={props.placeholder ?? 'дд.мм.гггг'}
    />
  );
}

const styles = StyleSheet.create({
  webInput: {
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    outlineStyle: 'none',
  },
});
