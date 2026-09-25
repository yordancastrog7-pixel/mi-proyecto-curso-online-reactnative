export type RootStackParamList = {
  Home: undefined;
  // Detalle de un curso en el que el estudiante está inscrito: el id y
  // cuántas lecciones lleva (para dibujar su barra de progreso).
  Detail: { courseId: string; completedLessons: number };
};
