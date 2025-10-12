class APIUnavailableError(Exception):
    pass


class RateLimitError(Exception):
    pass


class ValidationError(Exception):
    pass


class CSVParsingError(Exception):
    pass
