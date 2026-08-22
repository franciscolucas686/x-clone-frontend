import { Provider } from "react-redux";
import { sessionExpired } from "@/features/auth/authSlice";
import { setUnauthorizedHandler } from "@/shared/api/api-client";
import { store } from "@/app/store";
import { AppRoutes } from "@/routes/AppRoutes";

// Ligação feita no ponto de composição, uma vez. É o que permite ao api-client avisar
// que a sessão caiu sem importar o store — se ele o importasse, o ciclo seria
// store -> slices -> thunks -> api-client -> store.
setUnauthorizedHandler(() => {
  store.dispatch(sessionExpired());
});

function App() {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
}

export default App;
