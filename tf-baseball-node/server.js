/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

require('@tensorflow/tfjs-node-gpu');

const http = require('http');
const socketio = require('socket.io');
const pitch_type = require('./pitch_type');
const PORT = 8001;

async function run() {
  const port = process.env.PORT || PORT;
  const server = http.createServer();
  const io = socketio(server);
  let useTestData = true;

  server.listen(port, () => {
    console.log(`Running socket on port: ${port}`);
  });

  io.on('connection', (socket) => {
    socket.on('test_data', (value) => {
      useTestData = value === 'true' ? true : false;
    });

    socket.on('predictSample', async (sample) => {
      console.log('received predict request');
      io.emit('predictResult', await pitch_type.predictSample(sample));
    });
  });

  pitch_type.trainOrLoadModel(useTestData, (msg, data) => {
    console.log(">>>>>>>>>>>>>>>>>", msg, data);
    io.emit(msg, data);
  });
}

run();
