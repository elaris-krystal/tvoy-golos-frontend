import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Без этого компонента любая необработанная ошибка рендера где угодно
 * в дереве компонентов обрушивала бы всё приложение в белый экран без
 * возможности восстановления и без единого пояснения пользователю —
 * особенно плохой сценарий для аудитории, где часть пользователей менее
 * уверенно чувствует себя с техникой (категории «пенсия», «инвалидность»).
 *
 * Намеренно не отправляем стек ошибки на сервер автоматически — он может
 * содержать фрагменты состояния (в том числе текст обращения пользователя),
 * а у нас принцип «не собираем больше, чем нужно». console.error достаточно
 * для локальной отладки через DevTools, если пользователь сам поделится
 * скриншотом консоли через «Обратную связь».
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Необработанная ошибка в приложении:', error, info);
  }

  handleReload = () => {
    // Полная перезагрузка, а не просто сброс state — если ошибка вызвана
    // повреждённым состоянием в памяти (не в IndexedDB), soft-reset рискует
    // тут же воспроизвести ту же ошибку повторно.
    window.location.href = '/region';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-screen">
          <div className="error-boundary-content">
            <span className="error-boundary-icon" aria-hidden="true">⚠️</span>
            <h1>Что-то пошло не так</h1>
            <p>
              Произошла непредвиденная ошибка в приложении. Ваши сохранённые
              обращения в «Дневнике» никуда не пропали — они хранятся локально
              на устройстве и не зависят от этой ошибки.
            </p>
            <button className="btn-primary" onClick={this.handleReload}>
              Вернуться на главную
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
