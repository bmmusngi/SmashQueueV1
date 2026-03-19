# Frontend Components Documentation

This document serves as a comprehensive guide to all the frontend TypeScript/JSX components used in the SmashQueueV1 repository. Each component is documented with its purpose, props, and state management details.  

## Components

### 1. Button
- **Description**: A clickable button component for user interactions.
- **Props**:
  - `label`: The text displayed on the button.
  - `onClick`: Function executed when the button is clicked.
- **State**: None
- **Usage**:
  ```jsx
  <Button label="Submit" onClick={handleSubmit} />
  ```

### 2. InputField
- **Description**: A text input field for user input.
- **Props**:
  - `value`: The current value of the input field.
  - `onChange`: Function executed when the input value changes.
- **State**:
  - `inputValue`: Local state to control the input value.
- **Usage**:
  ```jsx
  <InputField value={inputValue} onChange={handleInputChange} />
  ```

### 3. Modal
- **Description**: A modal component for displaying content in an overlay.
- **Props**:
  - `isOpen`: Boolean to control the visibility of the modal.
  - `onClose`: Function executed to close the modal.
- **State**: None
- **Usage**:
  ```jsx
  <Modal isOpen={isModalOpen} onClose={closeModal} />
  ```

## React Hooks
- **useEffect**: Used in various components to manage side effects, such as data fetching.
- **useState**: Used to manage local state in functional components.

## State Management
The application utilizes **Zustand** for global state management. It provides a centralized store (`useQueueStore`) to manage session data, player lists, game state, and API interactions in a clean and efficient manner.

### Example of Zustand Store (`useQueueStore.js`)
```jsx
import { create } from 'zustand';

const useQueueStore = create((set) => ({
  players: [],
  addPlayer: (player) => set((state) => ({ players: [...state.players, player] })),
}));
```

---
This documentation will be updated as new components are added and existing components evolve.