# Backend Functions Documentation

This document serves as comprehensive documentation for all backend TypeScript functions used in the SmashQueueV1 project.

## Overview
This project utilizes TypeScript to create a RESTful API for the SmashQueue application. Each function is designed to handle specific logic and operations within the backend service.

## Function Descriptions

1. **Function Name**: `createQueue`
   - **Description**: Creates a new queue for players.
   - **Parameters**: 
     - `players: Player[]` - An array of players to be included in the queue.
   - **Returns**: `Queue` - The newly created queue object.
   - **Example**:
     ```typescript
     const queue = createQueue([{name: 'Player1'}, {name: 'Player2'}]);
     ```

2. **Function Name**: `joinQueue`
   - **Description**: Allows a player to join an existing queue.
   - **Parameters**: 
     - `queueId: string` - The ID of the queue to join.
     - `player: Player` - The player object.
   - **Returns**: `Queue` - The updated queue with the new player added.
   - **Example**:
     ```typescript
     joinQueue('queue123', {name: 'Player3'});
     ```

3. **Function Name**: `leaveQueue`
   - **Description**: Removes a player from the queue.
   - **Parameters**: 
     - `queueId: string` - The ID of the queue.
     - `playerId: string` - The ID of the player to remove.
   - **Returns**: `Queue` - The updated queue after the player has left.
   - **Example**:
     ```typescript
     leaveQueue('queue123', 'player3Id');
     ```

4. **Function Name**: `startMatch`
   - **Description**: Initiates a match for two players from the queue.
   - **Parameters**: 
     - `queueId: string` - The ID of the queue.
   - **Returns**: `Match` - The match object containing details of the initiated match.
   - **Example**:
     ```typescript
     const match = startMatch('queue123');
     ```

## Conclusion
The above functions represent the core functionalities of the backend for the SmashQueue application. Each function is designed to enhance the overall user experience by facilitating queue management and match initiation.