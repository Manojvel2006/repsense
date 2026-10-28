module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@navigation': './src/navigation',
          '@services': './src/services',
          '@hooks': './src/hooks',
          '@store': './src/store',
          '@types': './src/types',
          '@utils': './src/utils',
          '@theme': './src/theme',
          '@config': './src/config',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};