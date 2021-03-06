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
const argparse = require('argparse');
const sz_model = require('./strike_zone');

async function run(epochCount, savePath) {
  sz_model.model.summary();
  await sz_model.model.fitDataset(sz_model.trainingData, {
    epochs: epochCount,
    callbacks: {
      onEpochEnd: async (epoch, logs) => {
        console.log(`Epoch: ${epoch} - loss: ${logs.loss.toFixed(3)}`);
      }
    }
  });

  // Eval against test data:
  await sz_model.testValidationData.forEachAsync(data => {
    const evalOutput =
        sz_model.model.evaluate(data.xs, data.ys, sz_model.TEST_DATA_LENGTH);

    console.log(
        `\nEvaluation result:\n` +
        `  Loss = ${evalOutput[0].dataSync()[0].toFixed(3)}; ` +
        `Accuracy = ${evalOutput[1].dataSync()[0].toFixed(3)}`);
  });

  if (savePath !== null) {
    await sz_model.model.save(`file://${savePath}`);
    console.log(`Saved model to path: ${savePath}`);
  }
}

const parser = new argparse.ArgumentParser(
    {description: 'TensorFlow.js Strike Zone Training Example', addHelp: true});
parser.addArgument('--epochs', {
  type: 'int',
  defaultValue: 20,
  help: 'Number of epochs to train the model for.'
})
parser.addArgument('--model_save_path', {
  type: 'string',
  help: 'Path to which the model will be saved after training.'
});

const args = parser.parseArgs();

run(args.epochs, args.model_save_path);
