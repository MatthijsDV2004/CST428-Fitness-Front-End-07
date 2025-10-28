import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';

test('renders text correctly', () => {
  const { getByText } = render(<Text>Hello Expo!</Text>);
  expect(getByText('Hello Expo!')).toBeTruthy();
});