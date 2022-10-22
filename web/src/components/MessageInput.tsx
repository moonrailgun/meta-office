import { Input, InputRef } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useEvent } from '../hooks/useEvent';
import cx from 'classnames';
import { useGlobalContext } from '../context';

const TextArea = styled(Input.TextArea)`
  position: fixed;
  width: 300px;
  left: 50%;
  top: 50%;
  transform: translateX(-50%);
  opacity: 0;
  pointer-events: none;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 10px;
  resize: none;
  color: white;
  font-weight: 700;
  font-size: 20px;
  z-index: 9;

  &.active {
    opacity: 1;
    pointer-events: all;
  }
`;

// 激活输入状态的key
const InputTriggerKey = [
  // 0 ~ 9
  ...new Array(10).fill(0).map((_, i) => i.toString()),
  // 26英文字母
  ...new Array(26).fill(0).map((_, i) => String.fromCharCode(i + 97)),
];

const SendTriggerKey = ['Enter', 'NumpadEnter'];

export const MessageInput: React.FC = () => {
  const inputRef = useRef<InputRef>(null);
  const [value, setValue] = useState('');
  const {
    roomDataContext: { sendMessage },
  } = useGlobalContext();

  const handleStartInput = useEvent((e: KeyboardEvent) => {
    if (e.target !== document.body) {
      return;
    }

    if (!value && InputTriggerKey.includes(e.key.toLocaleLowerCase())) {
      setValue(e.key);
      inputRef.current?.focus({ cursor: 'end' });
    }
  });

  // const handleCommandSend = useEvent((e: KeyboardEvent) => {
  //   if (value && SendTriggerKey.includes(e.key) && e.metaKey) {
  //     sendMessage(value);
  //     setValue('');
  //     return;
  //   }
  // });

  useEffect(() => {
    window.addEventListener('keyup', handleStartInput);
    // window.addEventListener('keydown', handleCommandSend);

    return () => {
      window.removeEventListener('keyup', handleStartInput);
      // window.removeEventListener('keydown', handleCommandSend);
    };
  }, []);

  return (
    <TextArea
      className={cx({ active: Boolean(value) })}
      ref={inputRef}
      value={value}
      onChange={(e) => {
        if (/\n/.test(e.target.value)) {
          sendMessage(value);
          setValue('');
          return;
        }

        setValue(e.target.value);
      }}
    />
  );
};
