import { CONSUMER_ERROR_REPORTER_TYPE } from '../constants';

import type { Flipper } from 'react-native-flipper';

import type { Consumer, LogEventState } from '../types';

const FLIPPER_CONSUMER_NAME = 'Flipper';

type FlipperConsumerType = (options: {
  flipperPlugin: (plugin: Flipper.FlipperPlugin) => void;
}) => Consumer;

const flipperConsumerHandler =
  (flipperConnection: any) => (state: LogEventState) => {
    const {
      event = '',
      error = null,
      scope = '(default)',
      ...restOfdata
    } = state.data;

    const payload: any = {
      scope,
      level: state.levelName,
      event,
      message: state.message,
      data: restOfdata,
      error,
      time: Date.now(),
    };

    if (flipperConnection.current) {
      flipperConnection.current.send('action', payload);
    }
  };

export const FlipperConsumer: FlipperConsumerType = ({ flipperPlugin }) => {
  const flipperConnection = { current: null };

  const onConnect = (connection: any) => {
    flipperConnection.current = connection;
  };

  const onDisconnect = () => {
    flipperConnection.current = null;
  };

  return (options) => ({
    mount: () => {
      const flipperConfig = {
        runInBackground: () => true,
        getId() {
          return 'flipper-plugin-native-genesis-logger';
        },
        onConnect,
        onDisconnect,
      };
      flipperPlugin(flipperConfig);
    },
    umount: () => {},
    handler: flipperConsumerHandler(flipperConnection),
    name: FLIPPER_CONSUMER_NAME,
    type: CONSUMER_ERROR_REPORTER_TYPE,
    options,
  });
};
