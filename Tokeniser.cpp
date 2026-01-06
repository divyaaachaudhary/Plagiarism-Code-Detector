#include <bits/stdc++.h>
using namespace std;

set<string> keywords = {
    "if", "else", "for", "while", "return", "break", "continue"};

set<string> types = {
    "int", "float", "double", "char", "long", "short", "bool", "void"};

vector<string> tokenizeAndNormalize(string code)
{
    vector<string> raw;

    for (int i = 0; i < code.size();)
    {
        if (isspace(code[i]))
        {
            i++;
            continue;
        }

        if (isalpha(code[i]) || code[i] == '_')
        {
            string w;
            while (i < code.size() && (isalnum(code[i]) || code[i] == '_'))
                w += code[i++];
            if (types.count(w))
                raw.push_back("TYPE");
            else if (keywords.count(w))
                raw.push_back(w);
            else
                raw.push_back("VAR");
        }
        else if (isdigit(code[i]))
        {
            while (i < code.size() && isdigit(code[i]))
                i++;
            raw.push_back("NUM");
        }
        else
            raw.push_back(string(1, code[i++]));
    }

    vector<string> finalT;

    for (int i = 0; i < raw.size(); i++)
    {
        if (i + 2 < raw.size() && raw[i] == "TYPE" && raw[i + 2] == "(")
        {
            finalT.push_back("FUNC");
            finalT.push_back("TYPE");
            finalT.push_back("VAR");
            i += 1;
        }
        else
            finalT.push_back(raw[i]);
    }
    return finalT;
}

vector<pair<string, int>> tokenizeWithLines(string code)
{
    vector<pair<string, int>> raw;
    int line = 1;

    for (int i = 0; i < code.size();)
    {
        if (code[i] == '\n')
        {
            line++;
            i++;
            continue;
        }
        if (isspace(code[i]))
        {
            i++;
            continue;
        }

        if (isalpha(code[i]) || code[i] == '_')
        {
            string w;
            while (i < code.size() && (isalnum(code[i]) || code[i] == '_'))
                w += code[i++];
            if (types.count(w))
                raw.push_back({"TYPE", line});
            else if (keywords.count(w))
                raw.push_back({w, line});
            else
                raw.push_back({"VAR", line});
        }
        else if (isdigit(code[i]))
        {
            while (i < code.size() && isdigit(code[i]))
                i++;
            raw.push_back({"NUM", line});
        }
        else
            raw.push_back({string(1, code[i++]), line});
    }

    vector<pair<string, int>> norm;

    for (int i = 0; i < raw.size(); i++)
    {
        if (i + 2 < raw.size() && raw[i].first == "TYPE" && raw[i + 2].first == "(")
        {
            norm.push_back({"FUNC", raw[i].second});
            norm.push_back({"TYPE", raw[i].second});
            norm.push_back({"VAR", raw[i].second});
            i += 1;
        }
        else
        {
            string t = raw[i].first;
            if (t == "TYPE" || keywords.count(t) || t == "NUM" ||
                t == "(" || t == ")" || t == "{" || t == "}" || t == ";" || t == "," ||
                t == "+" || t == "-" || t == "*" || t == "/" || t == "=")
                norm.push_back(raw[i]);
            else
                norm.push_back({"VAR", raw[i].second});
        }
    }
    return norm;
}

void showCopiedLines(string code, map<int, int> &heat)
{
    stringstream ss(code);
    string line;
    int ln = 1;
    while (getline(ss, line))
    {
        if (heat[ln] > 0)
            cout << "🔥 " << ln << " | " << line << "\n";
        else
            cout << "   " << ln << " | " << line << "\n";
        ln++;
    }
}

void showHeatmap(map<int, int> &heat)
{
    cout << "\nPLAGIARISM HEATMAP\n";
    for (auto &x : heat)
    {
        cout << "Line " << x.first << " : ";
        for (int i = 0; i < x.second; i++)
            cout << "█";
        cout << "\n";
    }
}
