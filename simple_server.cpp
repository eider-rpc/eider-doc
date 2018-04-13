#include <eider_pybind11.hpp>

using namespace eider_pybind11;

struct DuckTester : LocalRoot {
    using LocalRoot::LocalRoot;

    bool is_it_a_duck(py::object obj) {
        return std::string(py::str(obj["looks"])) == "like a duck" &&
            std::string(py::str(obj["swims"])) == "like a duck" &&
            std::string(py::str(obj["quacks"])) == "like a duck";
    }
};

PYBIND11_MODULE(ducktest, m) {
    bind(m);

    py::class_<DuckTester, LocalRoot>(m, "DuckTester")
        .def(py::init<LocalSession>())
        .def("is_it_a_duck", &DuckTester::is_it_a_duck);
}
