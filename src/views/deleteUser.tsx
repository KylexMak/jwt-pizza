import React from 'react';
import { useLocation } from 'react-router-dom';
import { useBreadcrumb } from '../hooks/appNavigation';
import { pizzaService } from '../service/service';
import View from './view';
import Button from '../components/button';

export default function DeleteUSer() {
  const state = useLocation().state;
  const navigateToParent = useBreadcrumb();

  async function close() {
    await pizzaService.deleteUser(state.user);
    navigateToParent();
  }

  return (
    <View title='Are you sure?'>
      <div className='text-start py-8 px-4 sm:px-6 lg:px-8'>
        <div className='text-neutral-100'>
          Are you sure you want to delete the user <span className='text-orange-500'>{state.user.name}</span> with the email <span className='text-orange-500'>{state.user.email}</span> ? This cannot be
          restored.
        </div>
        <Button title='Close' onPress={close} />
        <Button title='Cancel' onPress={navigateToParent} className='bg-transparent border-neutral-300' />
      </div>
    </View>
  );
}