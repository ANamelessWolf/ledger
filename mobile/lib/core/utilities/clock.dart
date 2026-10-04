/// Injectable time source so date-dependent logic (sync window, default
/// filters) is testable.
typedef Clock = DateTime Function();

/// The system clock.
DateTime systemClock() => DateTime.now();
